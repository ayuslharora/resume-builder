import createDOMPurify from "dompurify";

const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "br", "ul", "ol", "li"];
const ALLOWED_ATTR = [];

let browserPurifier = null;

function getBrowserPurifier() {
  if (typeof window === "undefined" || !window.document) return null;
  if (!browserPurifier) {
    browserPurifier = createDOMPurify(window);
  }
  return browserPurifier;
}

function coerceHtml(value) {
  return typeof value === "string" ? value : "";
}

function sanitizeWithoutDom(value) {
  return coerceHtml(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*\/?>/gi, "")
    .replace(/<\/?([a-zA-Z0-9:-]+)(?:\s[^>]*)?>/g, (tag, tagName) => {
      const normalizedTag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.includes(normalizedTag)) return "";
      if (normalizedTag === "br") return "<br>";
      return tag.startsWith("</") ? `</${normalizedTag}>` : `<${normalizedTag}>`;
    });
}

export function sanitizeResumeHtml(value = "") {
  const html = coerceHtml(value);
  if (!html) return "";

  const purifier = getBrowserPurifier();
  if (purifier?.sanitize) {
    return purifier.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  }

  return sanitizeWithoutDom(html);
}

export function stripResumeHtml(value = "") {
  return sanitizeResumeHtml(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
