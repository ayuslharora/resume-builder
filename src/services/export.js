import { Document, Packer, Paragraph, HeadingLevel } from "docx";

async function collectPageCSS() {
  const sheets = Array.from(document.styleSheets);
  const parts = await Promise.all(
    sheets.map(async (sheet) => {
      try {
        // Same-origin sheets expose cssRules directly
        return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
      } catch {
        // Cross-origin sheets throw DOMException — fetch the text instead
        if (sheet.href) {
          try {
            const res = await fetch(sheet.href);
            return await res.text();
          } catch {
            return '';
          }
        }
        return '';
      }
    })
  );
  return parts.join('\n');
}

function buildStandaloneHTML(resumeElement, css) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { margin: 0; padding: 0; background: white; }
${css}
</style>
</head>
<body>
${resumeElement.outerHTML}
</body>
</html>`;
}

export async function exportPDF(resumeElement, fileName) {
  const css = await collectPageCSS();
  const html = buildStandaloneHTML(resumeElement, css);

  const response = await fetch('/api/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, fileName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `PDF API returned ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportDOCX(resumeData, fileName) {
  const personalDetails = [
    resumeData.personalInfo?.email,
    resumeData.personalInfo?.phone,
    resumeData.personalInfo?.location,
    resumeData.personalInfo?.linkedin
  ].filter(Boolean).join(" | ");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: resumeData.personalInfo?.fullName || "Resume", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: personalDetails, spacing: { after: 200 } }),
          new Paragraph({ text: resumeData.summary || "", spacing: { after: 400 } }),

          new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }),
          ...(resumeData.experience || []).flatMap(exp => [
            new Paragraph({ text: `${exp.role} at ${exp.company} (${exp.duration})`, heading: HeadingLevel.HEADING_3 }),
            ...(exp.bullets || []).map(b => new Paragraph({ text: b, bullet: { level: 0 } }))
          ]),

          new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
          ...(resumeData.education || []).flatMap(edu => [
            new Paragraph({ text: `${edu.degree} in ${edu.field} - ${edu.institution} (${edu.duration})`, heading: HeadingLevel.HEADING_3 })
          ]),

          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
          new Paragraph({ text: `Technical: ${(resumeData.skills?.technical || []).join(", ")}` }),
          new Paragraph({ text: `Soft: ${(resumeData.skills?.soft || []).join(", ")}` }),

          new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
          ...(resumeData.projects || []).flatMap(proj => [
            new Paragraph({ text: `${proj.name} ${proj.techStack?.length ? `[${proj.techStack.join(', ')}]` : ''}`, heading: HeadingLevel.HEADING_3 }),
            ...(proj.bullets || []).map(b => new Paragraph({ text: b, bullet: { level: 0 } }))
          ])
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
