"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getRoleRoute } from "@/lib/routes";

/** Bildirimler ayrı sayfa değil — panele yönlendir. */
export default function NotificationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    router.replace(role ? getRoleRoute(role) : "/login");
  }, [router]);

  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--muted-foreground)] animate-pulse-soft">Panele yönlendiriliyor…</p>
    </div>
  );
}
