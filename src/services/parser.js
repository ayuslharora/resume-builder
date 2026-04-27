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
  const mammoth = await loadMammoth();
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
    const pageText = extractTextFromPdfItems(textContent.items);
    fullText += pageText + "\n";
  }

  const normalizedText = normalizeExtractedText(fullText);
  const shouldUseOcr = isPdfTextTooSparse(normalizedText);

  if (!shouldUseOcr) {
    return {
      text: normalizedText,
      fileName: file.name,
      metadata: {
        extractionMethod: "native-text",
        usedOcr: false,
        extractionWarning: null,
        confidence: buildExtractionConfidence({
          extractionMethod: "native-text",
          text: normalizedText,
        }),
      },
    };
  }

  const ocrText = await extractPdfTextWithOcr(pdf);
  const combinedText = normalizeExtractedText([normalizedText, ocrText].filter(Boolean).join("\n\n"));

  if (!combinedText.trim()) {
    throw new Error("This PDF appears to contain images rather than selectable text, and OCR could not recover enough content.");
  }

  return {
    text: combinedText,
    fileName: file.name,
    metadata: {
      extractionMethod: "ocr-fallback",
      usedOcr: true,
      extractionWarning: "This PDF needed OCR because embedded text was missing or incomplete. Review the extracted content for accuracy.",
      confidence: buildExtractionConfidence({
        extractionMethod: "ocr-fallback",
        text: combinedText,
      }),
    },
  };
}

function extractTextFromPdfItems(items) {
  const lines = [];
  let currentLine = [];
  let currentY = null;

  for (const item of items) {
    if (!("str" in item) || !item.str?.trim()) continue;

    const y = Math.round(item.transform?.[5] ?? 0);
    if (currentY !== null && Math.abs(y - currentY) > 2) {
      lines.push(currentLine.join(" ").trim());
      currentLine = [];
    }

    currentLine.push(item.str.trim());
    currentY = y;
  }

  if (currentLine.length) {
    lines.push(currentLine.join(" ").trim());
  }

  return lines.join("\n");
}

function normalizeExtractedText(text) {
  return text
    .split("\u0000")
    .join(" ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isPdfTextTooSparse(text) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return wordCount < 40 || text.length < 200;
}

async function extractPdfTextWithOcr(pdf) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  let fullText = "";

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        throw new Error("Failed to initialize canvas for OCR.");
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const {
        data: { text },
      } = await worker.recognize(canvas);

      fullText += `${text}\n`;
    }
  } finally {
    await worker.terminate();
  }

  return fullText;
}

async function loadMammoth() {
  return import("mammoth");
}

function buildExtractionConfidence({ extractionMethod, text }) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (extractionMethod === "ocr-fallback") {
    if (wordCount > 250) {
      return {
        label: "Medium",
        score: 68,
        note: "OCR recovered substantial text, but scanned resumes can still contain recognition errors.",
      };
    }

    return {
      label: "Low",
      score: 42,
      note: "OCR recovered limited text. Some grading suggestions may be based on incomplete extraction.",
    };
  }

  if (wordCount > 250) {
    return {
      label: "High",
      score: 93,
      note: "Selectable text was extracted cleanly from the document.",
    };
  }

  return {
    label: "Medium",
    score: 74,
    note: "Text extraction succeeded, but the document provided limited parseable content.",
  };
}
