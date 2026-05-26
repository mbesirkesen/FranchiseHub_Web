/** Paginasyonlu veya düz dizi cevaplarını tek formata indirger. */
export function normalizeList<T>(data: unknown): T[] {
  if (data == null) {
    return [];
  }
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}
