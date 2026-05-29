/** Backend cevap metnindeki debug / ham filtre sızıntılarını temizler. */
export function sanitizeAgentAnswer(text: string): string {
  if (!text?.trim()) return text ?? "";

  let s = text;

  // «abi», «gıda» gibi dahili token'lar
  s = s.replace(/«[^»]*»/g, "");
  s = s.replace(/&laquo;[^&]*&raquo;/g, "");

  // Parantez içi filtre kalıntıları: (Marmara - ) → (Marmara) veya sil
  s = s.replace(/\(([^()]*)\)/g, (_, inner: string) => {
    const cleaned = inner
      .replace(/[«»]/g, "")
      .replace(/\s+[-–—]\s*\.?\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned || /^[-–—·.\s]+$/.test(cleaned)) return "";
    return `(${cleaned})`;
  });

  s = s.replace(/\(\s*\)/g, "");
  s = s.replace(/\s+([.,!?;:])/g, "$1");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/\.\s*\./g, ".");

  return s.trim();
}
