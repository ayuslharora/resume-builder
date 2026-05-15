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

// Returns the base wrapper style — always Arial so unformatted text inherits it.
// Per-selection font changes are applied via execCommand in the editor toolbar.
export function getResumeTypographyStyle(_theme) {
  return { fontFamily: DEFAULT_RESUME_FONT };
}
