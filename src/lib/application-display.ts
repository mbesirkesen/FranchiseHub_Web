import { Application, ConversationItem } from "@/lib/types";

export function getApplicationBrandName(
  app: Pick<Application, "id" | "brand_id" | "brand" | "brand_name">,
  conv?: Pick<ConversationItem, "brand_name"> | null,
): string {
  if (app.brand?.name?.trim()) return app.brand.name.trim();
  if (app.brand_name?.trim()) return app.brand_name.trim();
  if (conv?.brand_name?.trim()) return conv.brand_name.trim();
  if (app.brand_id != null) return `Marka #${app.brand_id}`;
  return `Başvuru #${app.id}`;
}

export function getApplicationBuyerName(
  app: Pick<Application, "buyer_name">,
  conv?: Pick<ConversationItem, "buyer_name"> | null,
): string | null {
  const name = app.buyer_name?.trim() || conv?.buyer_name?.trim();
  return name || null;
}

export function formatApplicationDate(value?: string | null): string {
  if (!value) return "";
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

export function applicationListTitle(
  app: Pick<Application, "id" | "brand_id" | "brand" | "brand_name">,
  conv?: Pick<ConversationItem, "brand_name"> | null,
): string {
  return getApplicationBrandName(app, conv);
}
