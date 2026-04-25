import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

export async function exportPDF(resumeElement, fileName) {
  const canvas = await html2canvas(resumeElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: resumeElement.scrollWidth,
    windowHeight: resumeElement.scrollHeight,
  });
  
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  const pdf = new jsPDF("p", "mm", "a4");
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(`${fileName}.pdf`);
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
