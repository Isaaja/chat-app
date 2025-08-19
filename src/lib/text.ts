export function previewOrEllipsis(text: string, maxChars = 40): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return "(.....)";
}
