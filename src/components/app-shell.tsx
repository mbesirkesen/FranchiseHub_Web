"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { NotificationsPanel } from "@/components/notifications-panel";
import { clearSession, getUserRole } from "@/lib/auth";
import { getActiveSideNavHref, getRoleRoute, SideNavItem } from "@/lib/routes";
import { UserRole } from "@/lib/types";

const roleRoutes: SideNavItem[] = [
  { href: "/buyer", label: "Franchise arayan" },
  { href: "/franchise-owner", label: "Marka sahibi" },
];

function roleDisplayLabel(role: UserRole | null): string {
  if (role === "franchise_owner") return "Marka sahibi";
  if (role === "buyer") return "Franchise arayan";
  return "—";
}

type Props = {
  children: ReactNode;
  title: string;
  sideNav?: SideNavItem[];
  asideTitle?: string;
};

export function AppShell({ children, title, sideNav, asideTitle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [searchQ, setSearchQ] = useState("");

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
  const showToolbar = Boolean(sideNav);

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="page-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(9,11,16,0.88)] backdrop-blur-xl">
        <div className="page-container flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                FH
              </span>
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  FranchiseHub
                </p>
                <h1 className="text-sm font-semibold text-[var(--foreground)]">{title}</h1>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showToolbar ? (
              <form onSubmit={onSearch} className="hidden sm:block">
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Ara…"
                  className="input w-40 md:w-52"
                />
              </form>
            ) : null}
            {showToolbar ? <NotificationsPanel /> : null}
            {showToolbar ? (
              <Link href="/profile" className="btn btn-secondary btn-sm">
                Profil
              </Link>
            ) : null}
            <button type="button" onClick={logout} className="btn btn-ghost btn-sm">
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="page-container flex gap-6 py-8">
        <aside className="card hidden w-56 shrink-0 p-4 md:block">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {sidebarHeading}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-link nav-link-active" : "nav-link"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {showRoleSwitcher ? (
            <>
              <p className="mt-6 text-xs text-[var(--muted)]">Aktif rol: {roleDisplayLabel(role)}</p>
              {role ? (
                <button
                  type="button"
                  onClick={() => router.push(getRoleRoute(role))}
                  className="btn btn-secondary btn-sm btn-block mt-2"
                >
                  Panele git
                </button>
              ) : null}
            </>
          ) : (
            <p className="mt-6 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
              {roleDisplayLabel(role)}
            </p>
          )}
        </aside>

        <section className="card min-w-0 flex-1 p-6 md:p-8">{children}</section>
      </div>
    </div>
  );
}
