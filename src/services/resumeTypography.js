export const POPULAR_RESUME_FONTS = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Calibri, Arial, sans-serif", label: "Calibri" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "'Trebuchet MS', Arial, sans-serif", label: "Trebuchet MS" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "Cambria, Georgia, serif", label: "Cambria" },
  { value: "Garamond, 'Times New Roman', serif", label: "Garamond" },
];

export const DEFAULT_RESUME_FONT = POPULAR_RESUME_FONTS[0].value;
export const DEFAULT_RESUME_FONT_SIZE = 16;

export function getResumeTypographyStyle(theme) {
  const selectedSize = Number(theme?.fontSize);
  const fontSize = Number.isFinite(selectedSize)
    ? Math.min(20, Math.max(12, selectedSize))
    : DEFAULT_RESUME_FONT_SIZE;

  return {
    fontFamily: theme?.fontFamily || DEFAULT_RESUME_FONT,
    fontSize: `${fontSize}px`,
  };
}
