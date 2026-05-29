import { UserRole } from "@/lib/types";

export type SideNavItem = {
  href: string;
  label: string;
  /** Basit emoji — teknik olmayan kullanıcılar için görsel ipucu */
  icon?: string;
  hint?: string;
};

export function getRoleRoute(role: UserRole) {
  if (role === "franchise_owner") {
    return "/franchise-owner";
  }
  return `/${role}`;
}

/** Marka sahibi: günlük iş, az menü, sade dil */
export const FRANCHISE_OWNER_NAV: SideNavItem[] = [
  { href: "/franchise-owner", label: "Bugün", icon: "🏠", hint: "Ne yapmalıyım?" },
  { href: "/franchise-owner/applications", label: "Başvurular", icon: "📋", hint: "Gelen talepler" },
  { href: "/franchise-owner/messages", label: "Mesajlar", icon: "💬", hint: "Adaylarla yazışın" },
  { href: "/franchise-owner/brand", label: "Markam", icon: "🏷️", hint: "Vitrin bilgileri" },
  { href: "/franchise-owner/stock", label: "Depo & Sipariş", icon: "📦", hint: "Stok ve malzeme" },
];

/** Alıcı / bayi: önce marka bul, onaydan sonra bayi olarak devam */
export const BUYER_NAV: SideNavItem[] = [
  { href: "/buyer", label: "Ana sayfa", icon: "🏠", hint: "Durumunuz" },
  { href: "/buyer/discover", label: "Marka bul", icon: "🔍", hint: "Franchise ara" },
  { href: "/buyer/applications", label: "Başvurum", icon: "📄", hint: "Süreciniz" },
  { href: "/buyer/messages", label: "Mesajlar", icon: "💬", hint: "Markayla yazışın" },
];

export function getActiveSideNavHref(pathname: string, items: SideNavItem[]): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const matches = items.filter((item) => {
    const h = item.href.replace(/\/$/, "") || "/";
    return normalized === h || normalized.startsWith(`${h}/`);
  });
  if (matches.length === 0) {
    return null;
  }
  return matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b)).href;
}

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Olumsuz",
};

export const APPLICATION_STATUS_HINT: Record<string, string> = {
  pending: "Marka sahibi inceliyor",
  approved: "Tebrikler — artık bayiisiniz. Mesajlara bakın.",
  rejected: "Bu marka için süreç kapandı",
};

export const SUPPLY_STATUS_LABEL: Record<string, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  shipped: "Yolda",
};
