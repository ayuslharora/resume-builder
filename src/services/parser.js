import * as mammoth from "mammoth";

export async function parseDocument(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  try {
    if (extension === "txt") {
      return await parseTxt(file);
    } else if (extension === "docx") {
      return await parseDocx(file);
    } else if (extension === "pdf") {
      return await parsePdf(file);
    } else {
      throw new Error("Unsupported file format. Please upload TXT, DOCX, or PDF.");
    }
  } catch (err) {
    console.error("Parse Error:", err);
    throw new Error(`Failed to read the file: ${err.message}`);
  }
}

function parseTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ text: e.target.result, fileName: file.name });
    reader.onerror = () => reject(new Error("Failed to read TXT file"));
    reader.readAsText(file);
  });
}

async function parseDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: result.value, fileName: file.name };
}

async function parsePdf(file) {
  // Dynamically import pdfjs-dist only when a PDF is actually being parsed
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return { text: fullText.trim(), fileName: file.name };
}
