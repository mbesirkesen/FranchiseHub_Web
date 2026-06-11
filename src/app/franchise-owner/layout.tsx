"use client";

import { ReactNode } from "react";
import { FranchiseAgent } from "@/components/agent/franchise-agent";
import { PanelShell } from "@/components/panel-shell";
import { RoleGuard } from "@/components/role-guard";
import { FRANCHISE_OWNER_NAV } from "@/lib/routes";

export default function FranchiseOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="franchise_owner">
      <PanelShell
        title="Marka paneli"
        subtitle="Günlük işleriniz burada"
        sideNav={FRANCHISE_OWNER_NAV}
      >
        {children}
      </PanelShell>
      <FranchiseAgent role="franchise_owner" />
    </RoleGuard>
  );
}
