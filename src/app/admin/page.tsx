"use client";

import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";
import { ADMIN_NAV } from "@/lib/routes";

export default function AdminPage() {
  return (
    <RoleGuard role="admin">
      <AppShell title="Yönetim paneli" sideNav={ADMIN_NAV} asideTitle="Menü">
        <h2 className="text-lg font-semibold text-slate-50">Platform Denetimi</h2>
        <p className="mt-2 text-sm text-slate-400">
          Kullanici listeleme, marka onayi ve basvuru override akislarini ekleyecegiz.
        </p>
      </AppShell>
    </RoleGuard>
  );
}
