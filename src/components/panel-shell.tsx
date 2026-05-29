"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { CommandPalette } from "@/components/interaction/command-palette";
import { PanelViewTransition } from "@/components/motion/panel-view-transition";
import { NotificationsPanel } from "@/components/notifications-panel";
import { clearSession, getUserRole } from "@/lib/auth";
import { getActiveSideNavHref, SideNavItem } from "@/lib/routes";
import { UserRole } from "@/lib/types";

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  sideNav: SideNavItem[];
  showNotifications?: boolean;
};

function roleGreeting(role: UserRole | null): string {
  if (role === "franchise_owner") return "Marka sahibi";
  if (role === "buyer") return "Franchise arayan";
  return "Panel";
}

export function PanelShell({ children, title, subtitle, sideNav, showNotifications = true }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const activeHref = useMemo(
    () => getActiveSideNavHref(pathname, sideNav),
    [pathname, sideNav],
  );

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="page-shell min-h-screen pb-20 md:pb-0">
      <header className="site-header">
        <div className="page-container flex items-center justify-between gap-3 py-4">
          <div className="min-w-0 animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {roleGreeting(role)}
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--foreground)]">{title}</h1>
            {subtitle ? (
              <p className="truncate text-sm text-[var(--muted-foreground)]">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CommandPalette />
            {showNotifications ? <NotificationsPanel /> : null}
            <Link href="/profile" className="btn btn-secondary btn-sm hidden sm:inline-flex">
              Hesabım
            </Link>
            <button type="button" onClick={logout} className="btn btn-ghost btn-sm">
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="page-container flex gap-6 py-6 md:py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-2">
            {sideNav.map((item, i) => {
              const active = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-tile nav-tile-active animate-fade-up" : "nav-tile animate-fade-up"}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="nav-tile-icon" aria-hidden>
                    {item.icon ?? "•"}
                  </span>
                  <span>
                    <span className="nav-tile-label">{item.label}</span>
                    {item.hint ? <span className="nav-tile-hint">{item.hint}</span> : null}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 animate-fade-up" style={{ animationDelay: "0.08s" }}>
          <PanelViewTransition>{children}</PanelViewTransition>
        </section>
      </div>

      <nav className="bottom-nav md:hidden" aria-label="Ana menü">
        {sideNav.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "bottom-nav-item bottom-nav-item-active" : "bottom-nav-item"}
            >
              <span aria-hidden>{item.icon ?? "•"}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
