import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

export async function exportPDF(resumeElement, fileName) {
  // Temporarily remove shadow to prevent html2canvas from capturing extra padding
  const originalBoxShadow = resumeElement.style.boxShadow;
  resumeElement.style.boxShadow = 'none';

  const canvas = await html2canvas(resumeElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: resumeElement.scrollWidth,
    windowHeight: resumeElement.scrollHeight,
  });
  
  // Restore original shadow
  resumeElement.style.boxShadow = originalBoxShadow;
  
  const imgWidth = 210; // A4 width in mm
  const minPageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Set the PDF page height to match the resume's exact height (with a minimum of A4 height)
  // This ensures the entire resume fits on a single continuous page without cutting content.
  const finalHeight = Math.max(minPageHeight, imgHeight);
  
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [imgWidth, finalHeight]
  });
  
  pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0, imgWidth, imgHeight);

  // Add clickable links on top of the image
  const linkElements = resumeElement.querySelectorAll('[data-pdf-link]');
  const containerRect = resumeElement.getBoundingClientRect();
  const pxToMm = imgWidth / containerRect.width;

  console.log(`Found ${linkElements.length} link elements`);

  linkElements.forEach(el => {
    const url = el.getAttribute('data-pdf-link');
    if (!url) return;

    // Fix missing http/https
    const validUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    const rect = el.getBoundingClientRect();
    
    // Coordinates relative to the resume container
    const relativeX = rect.left - containerRect.left;
    const relativeY = rect.top - containerRect.top;

    const pdfX = relativeX * pxToMm;
    const pdfY = relativeY * pxToMm;
    const pdfW = rect.width * pxToMm;
    const pdfH = rect.height * pxToMm;

    console.log(`Link: ${validUrl}, x:${pdfX}, y:${pdfY}, w:${pdfW}, h:${pdfH}`);

    // Use pdf.link to create an invisible clickable box
    // DEBUG: Draw a visible red box so we can visually confirm it's in the right spot!
    pdf.setDrawColor(255, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(pdfX, pdfY, pdfW, pdfH);
    
    // Add the actual link annotation
    pdf.link(pdfX, pdfY, pdfW, pdfH, { url: validUrl });
  });

  // MASSIVE DEBUG LINK: Create a huge 100x100 link in the top left of the page to test if links work at all
  pdf.setDrawColor(0, 0, 255);
  pdf.rect(0, 0, 100, 100);
  pdf.link(0, 0, 100, 100, { url: 'https://google.com' });

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
