"use client";

import { ReactNode } from "react";
import { FranchiseAgent } from "@/components/agent/franchise-agent";
import { PanelShell } from "@/components/panel-shell";
import { RoleGuard } from "@/components/role-guard";
import { BUYER_NAV } from "@/lib/routes";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="buyer">
      <PanelShell title="Paneliniz" subtitle="Marka bulun veya başvurunuzu takip edin" sideNav={BUYER_NAV}>
        {children}
      </PanelShell>
      <FranchiseAgent />
    </RoleGuard>
  );
}
