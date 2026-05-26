"use client";

import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";
import { FRANCHISE_OWNER_NAV } from "@/lib/routes";

export default function FranchiseOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="franchise_owner">
      <AppShell title="Franchise Sahibi Paneli" sideNav={FRANCHISE_OWNER_NAV} asideTitle="Panel">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
