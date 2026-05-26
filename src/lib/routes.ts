import { UserRole } from "@/lib/types";

export type SideNavItem = {
  href: string;
  label: string;
};

export function getRoleRoute(role: UserRole) {
  if (role === "franchise_owner") {
    return "/franchise-owner";
  }

  return `/${role}`;
}

export const FRANCHISE_OWNER_NAV: SideNavItem[] = [
  { href: "/franchise-owner", label: "Özet" },
  { href: "/franchise-owner/brand", label: "Marka profili" },
  { href: "/franchise-owner/applications", label: "Başvurular" },
  { href: "/franchise-owner/inventory", label: "Envanter" },
  { href: "/franchise-owner/supply", label: "Tedarik" },
  { href: "/franchise-owner/reports", label: "Raporlar" },
];

export const BUYER_NAV: SideNavItem[] = [{ href: "/buyer", label: "Marka ve başvuru" }];

export const ADMIN_NAV: SideNavItem[] = [{ href: "/admin", label: "Yönetim" }];

/** En uzun eşleşen href aktif kabul edilir (Özet /franchise-owner alt rotalarında yanlış yanmaz). */
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
