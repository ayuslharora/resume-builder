function stripDecoration(line) {
  return line
    .replace(/^\s*[•\-–—]\s*/, "")
    .replace(/^\s*↳\s*/, "")
    .trim();
}

function looksLikeHeading(line, focus) {
  if (!line) return false;
  const cleanedLine = line.trim().toLowerCase().replace(/[:\s]+$/, "");
  const cleanedFocus = focus ? focus.trim().toLowerCase().replace(/[:\s]+$/, "") : "";
  
  if (cleanedFocus && cleanedLine === cleanedFocus) return true;
  
  // Common heading patterns the AI might use
  return /^(technical focus|ats keywords|impact focus|leadership focus|option|variation|rewrite)\b/i.test(cleanedLine);
}

export function sanitizeRewriteOption(option = {}) {
  const rawVersion = typeof option.version === "string" ? option.version : "";
  const focus = typeof option.focus === "string" ? option.focus : "";

  const lines = rawVersion
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const filteredLines = lines.filter((line, index) => {
    if (index === 0 && looksLikeHeading(line, focus)) return false;
    if (/^why it works[:\s]/i.test(line)) return false;
    return true;
  });

  const candidateLines = filteredLines.length > 0 ? filteredLines : lines;
  const version = candidateLines.map(stripDecoration).filter(Boolean).join(" ").trim();

  return {
    ...option,
    version,
  };
}
