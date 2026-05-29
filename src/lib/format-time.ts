export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;

  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 45) return "Az önce";
  if (diffSec < 3600) {
    const min = Math.floor(diffSec / 60);
    return `${min} dk önce`;
  }
  if (diffSec < 86400) {
    const hr = Math.floor(diffSec / 3600);
    return `${hr} sa önce`;
  }
  if (diffSec < 604800) {
    const day = Math.floor(diffSec / 86400);
    return `${day} gün önce`;
  }

  return new Date(ms).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
