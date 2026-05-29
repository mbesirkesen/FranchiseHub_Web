"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { NotificationsPanel } from "@/components/notifications-panel";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="page-shell min-h-screen">
        <header className="site-header">
          <div className="page-container flex h-14 items-center justify-between">
            <Link href="/" className="brand-mark">
              <span className="brand-mark-icon">FH</span>
              <span className="brand-mark-text">FranchiseHub</span>
            </Link>
            <NotificationsPanel />
          </div>
        </header>
        <main className="page-container py-10">
          <div className="mx-auto max-w-lg animate-fade-up">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
