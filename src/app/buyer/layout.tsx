"use client";

import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import { FranchiseAgent } from "@/components/agent/franchise-agent";
import { PanelShell } from "@/components/panel-shell";
import { RoleGuard } from "@/components/role-guard";
import { getBuyerApplications, getBuyerDashboardSummary, getMe } from "@/lib/api";
import { BUYER_NAV } from "@/lib/routes";
import { Application, BuyerDashboardSummary, UserProfile } from "@/lib/types";

function displayName(me: UserProfile | undefined): string {
  if (me?.first_name?.trim()) return me.first_name.trim();
  if (me?.full_name?.trim()) return me.full_name.trim().split(/\s+/)[0] ?? me.full_name;
  if (me?.email) return me.email.split("@")[0] ?? "Yatırımcı";
  return "Yatırımcı";
}

function smartSubtitle(apps: Application[], summary: BuyerDashboardSummary | undefined): string {
  const pending = apps.filter((a) => a.status === "pending").length;
  if (pending === 1) return "Bugün ilgilenmen gereken 1 başvurunuz var.";
  if (pending > 1) return `Bugün ilgilenmen gereken ${pending} başvurunuz var.`;

  const approved = apps.filter((a) => a.status === "approved").length;
  if (approved > 0) return "Bayi süreciniz aktif — panelinizi kontrol edin.";

  const fav = summary?.favorites_count ?? 0;
  if (fav > 0) return `${fav} favori markanız kayıtlı — keşfe devam edin.`;

  if (apps.length > 0) return "Başvurularınızı buradan takip edebilirsiniz.";

  return "Size uygun franchise fırsatlarını keşfedin.";
}

function BuyerPanelShell({ children }: { children: ReactNode }) {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const summaryQuery = useQuery({
    queryKey: ["buyer-dashboard-summary"],
    queryFn: () => getBuyerDashboardSummary(),
  });
  const appsQuery = useQuery({
    queryKey: ["buyer-applications"],
    queryFn: () => getBuyerApplications(),
    retry: false,
  });

  const title = meQuery.isSuccess
    ? `Hoş geldin, ${displayName(meQuery.data)}`
    : meQuery.isLoading
      ? "Hoş geldin…"
      : "Hoş geldin";

  const subtitle = smartSubtitle(appsQuery.data ?? [], summaryQuery.data);

  return (
    <PanelShell title={title} subtitle={subtitle} sideNav={BUYER_NAV}>
      {children}
    </PanelShell>
  );
}

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="buyer">
      <BuyerPanelShell>{children}</BuyerPanelShell>
      <FranchiseAgent />
    </RoleGuard>
  );
}
