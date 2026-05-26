"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { clearSession, getUserRole } from "@/lib/auth";
import { getActiveSideNavHref, getRoleRoute, SideNavItem } from "@/lib/routes";
import { UserRole } from "@/lib/types";

const roleRoutes: SideNavItem[] = [
  { href: "/buyer", label: "Buyer" },
  { href: "/franchise-owner", label: "Franchise Owner" },
  { href: "/admin", label: "Admin" },
];

function roleDisplayLabel(role: UserRole | null): string {
  if (role === "franchise_owner") return "Franchise sahibi";
  if (role === "buyer") return "Alıcı";
  if (role === "admin") return "Yönetici";
  return "—";
}

type Props = {
  children: ReactNode;
  title: string;
  /** Verilirse sol menüde yalnızca bu bağlantılar gösterilir; rol panelleri arası geçiş gösterilmez. */
  sideNav?: SideNavItem[];
  asideTitle?: string;
};

export function AppShell({ children, title, sideNav, asideTitle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const navItems = sideNav ?? roleRoutes;
  const activeHref = useMemo(
    () => getActiveSideNavHref(pathname, navItems),
    [pathname, navItems],
  );
  const sidebarHeading = asideTitle ?? (sideNav ? "Menü" : "Roller");
  const showRoleSwitcher = !sideNav;

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-400/20 bg-slate-950/35 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">FranchiseHub Web</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-50">{title}</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/60 hover:bg-slate-900/60"
          >
            Çıkış Yap
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-8">
        <aside className="glass-card w-56 shrink-0 rounded-2xl p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {sidebarHeading}
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                      : "border border-slate-500/30 bg-slate-950/35 text-slate-200 hover:border-cyan-400/40 hover:bg-slate-900/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {showRoleSwitcher ? (
            <>
              <p className="mt-5 text-xs text-slate-500">Aktif rol: {roleDisplayLabel(role)}</p>
              {role ? (
                <button
                  type="button"
                  onClick={() => router.push(getRoleRoute(role))}
                  className="mt-2 w-full rounded-xl border border-slate-500/35 bg-slate-950/40 px-3 py-2 text-xs text-slate-200 hover:border-cyan-400/35"
                >
                  Kendi panelime git
                </button>
              ) : null}
            </>
          ) : (
            <p className="mt-5 border-t border-slate-500/20 pt-4 text-[11px] leading-relaxed text-slate-500">
              {roleDisplayLabel(role)}
            </p>
          )}
        </aside>
        <section className="glass-card min-w-0 flex-1 rounded-2xl p-6 md:p-8">{children}</section>
      </main>
    </div>
  );
}
