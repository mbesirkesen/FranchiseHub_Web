import { UserRole } from "@/lib/types";

export type CommandAction = {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  keywords?: string[];
  group: string;
};

export function getCommandActions(role: UserRole | null): CommandAction[] {
  const homeHref = role === "franchise_owner" ? "/franchise-owner" : role === "buyer" ? "/buyer" : "/";

  const common: CommandAction[] = [
    { id: "profile", label: "Hesabım", href: "/profile", group: "Sayfalar", keywords: ["profil", "ayar"] },
    { id: "home", label: "Ana sayfa", href: homeHref, group: "Sayfalar" },
  ];

  if (role === "franchise_owner") {
    return [
      ...common,
      { id: "fo-apps", label: "Başvurular", href: "/franchise-owner/applications", group: "Marka sahibi", keywords: ["onay", "talep"] },
      { id: "fo-stock", label: "Depo & sipariş", href: "/franchise-owner/stock", group: "Marka sahibi", keywords: ["envanter", "tedarik"] },
      { id: "fo-brand", label: "Markam", href: "/franchise-owner/brand", group: "Marka sahibi", keywords: ["profil", "vitrin"] },
    ];
  }

  if (role === "buyer") {
    return [
      ...common,
      { id: "buy-discover", label: "Marka bul", href: "/buyer/discover", group: "Yatırımcı", keywords: ["keşif", "ara", "fırsat"] },
      { id: "buy-apps", label: "Başvurum", href: "/buyer/applications", group: "Yatırımcı", keywords: ["durum", "mesaj"] },
      { id: "buy-spot-gida", label: "Gıda sektörü fırsatları", href: "/buyer/discover?sector=G%C4%B1da", group: "Spotlight", keywords: ["gıda", "restoran"] },
      { id: "buy-spot-budget", label: "500 bin TL altı markalar", href: "/buyer/discover?max=500000", group: "Spotlight", keywords: ["bütçe", "500000"] },
    ];
  }

  return [
    { id: "login", label: "Giriş yap", href: "/login", group: "Genel" },
    { id: "register", label: "Kayıt ol", href: "/register", group: "Genel" },
    { id: "how", label: "Nasıl çalışır?", href: "/how-it-works", group: "Genel" },
  ];
}

export function filterCommandActions(actions: CommandAction[], query: string): CommandAction[] {
  const q = query.trim().toLowerCase();
  if (!q) return actions;
  return actions.filter(
    (a) =>
      a.label.toLowerCase().includes(q) ||
      a.group.toLowerCase().includes(q) ||
      a.keywords?.some((k) => k.includes(q) || q.includes(k)),
  );
}

export function parseSpotlightQuery(query: string): string | null {
  const q = query.toLowerCase();
  if (!q.includes("marka") && !q.includes("franchise") && !q.includes("fırsat") && !q.includes("bul")) {
    return null;
  }

  const params = new URLSearchParams();
  if (q.includes("gıda") || q.includes("gida") || q.includes("restoran")) params.set("sector", "Gıda");
  if (q.includes("kahve")) params.set("sector", "Kahve");
  if (q.includes("güzellik") || q.includes("guzellik")) params.set("sector", "Güzellik");

  const budgetMatch = q.match(/(\d+)\s*(bin|k|milyon|tl)?/);
  if (budgetMatch) {
    let n = Number(budgetMatch[1]);
    if (q.includes("bin") || budgetMatch[2] === "k") n *= 1000;
    if (q.includes("milyon")) n *= 1_000_000;
    if (q.includes("altı") || q.includes("alti") || q.includes("max")) params.set("max", String(n));
  }

  if (q.includes("istanbul")) params.set("location", "İstanbul");
  if (q.includes("ankara")) params.set("location", "Ankara");
  if (q.includes("izmir")) params.set("location", "İzmir");

  const qs = params.toString();
  return `/buyer/discover${qs ? `?${qs}` : ""}`;
}
