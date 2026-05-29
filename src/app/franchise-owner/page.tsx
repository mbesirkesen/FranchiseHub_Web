"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { FranchiseOwnerTour } from "@/components/onboarding/franchise-owner-tour";
import { FranchiseOwnerDashboard } from "@/components/franchise/owner-dashboard";
import { BentoActionLink } from "@/components/interaction/bento-action-link";
import { BentoCell, BentoGrid } from "@/components/interaction/bento-grid";
import { BentoMetricCell } from "@/components/interaction/bento-metric-cell";
import { MagneticButton } from "@/components/interaction/magnetic-button";
import { SkeletonBento } from "@/components/interaction/skeleton";
import { EmptyState, HelpBox, StatusPill } from "@/components/ui/simple-blocks";
import { getFranchiseDashboardSummary, getMyBrandApplications } from "@/lib/api";
import { Application } from "@/lib/types";

function parseAppDate(a: Application): number {
  if (!a.created_at) return 0;
  const ms = Date.parse(a.created_at);
  return Number.isFinite(ms) ? ms : 0;
}

export default function FranchiseOwnerHomePage() {
  const summaryQuery = useQuery({
    queryKey: ["franchise-dashboard-summary"],
    queryFn: () => getFranchiseDashboardSummary(),
  });

  const applicationsQuery = useQuery({
    queryKey: ["franchise-applications"],
    queryFn: () => getMyBrandApplications(),
  });

  const s = summaryQuery.data;
  const apps = applicationsQuery.data ?? [];
  const pendingCount = s?.pending_applications ?? 0;
  const loading = summaryQuery.isLoading || applicationsQuery.isLoading;
  const lowStockHint =
    s && s.inventory_item_count != null && s.inventory_item_count === 0
      ? "Depoya ürün ekleyin"
      : "Stok ve malzeme siparişi";

  const recentApps = useMemo(() => {
    return [...apps].sort((a, b) => parseAppDate(b) - parseAppDate(a)).slice(0, 3);
  }, [apps]);

  if (loading) {
    return <SkeletonBento />;
  }

  return (
    <div className="space-y-4">
      <BentoGrid>
        <BentoCell span="2" className="flex flex-col justify-center bento-cell-hero" data-tour="fo-hero">
          <p className="bento-hero-title">{s?.brand_name ? `Merhaba, ${s.brand_name}` : "Markanızın nabzı"}</p>
          <p className="bento-hero-sub">
            {s?.has_brand === false
              ? "Önce markanızı oluşturun — sonra başvurular gelmeye başlar."
              : pendingCount > 0
                ? `${pendingCount} kişi sizden haber bekliyor.`
                : "Verileriniz güncel — markanız güvende."}
          </p>
          {s?.has_brand === false ? (
            <MagneticButton strength={0.22} className="mt-5">
              <Link href="/franchise-owner/brand" className="btn btn-primary btn-glow w-fit px-6">
                İlk markanızı oluşturun
              </Link>
            </MagneticButton>
          ) : null}
        </BentoCell>

        <BentoMetricCell
          label="Bekleyen"
          value={pendingCount}
          watermark="⏳"
          valueClassName="text-[var(--primary)]"
        />
      </BentoGrid>

      {summaryQuery.isError ? <p className="alert alert-error">Özet yüklenemedi.</p> : null}

      <FranchiseOwnerDashboard summary={s} applications={apps} loading={false} />

      {summaryQuery.isSuccess && s && !s.has_brand ? (
        <HelpBox>
          Henüz marka profiliniz yok.{" "}
          <Link href="/franchise-owner/brand" className="font-semibold text-[var(--primary-hover)] underline">
            Markam sayfasından
          </Link>{" "}
          oluşturabilirsiniz.
        </HelpBox>
      ) : null}

      <BentoGrid>
        <BentoCell data-tour="fo-applications">
          <BentoActionLink
            href="/franchise-owner/applications"
            title="Gelen başvurular"
            description="Onaylayın veya reddedin."
            accent="gold"
            icon="BA"
            badge={pendingCount}
          />
        </BentoCell>
        <BentoCell data-tour="fo-stock">
          <BentoActionLink
            href="/franchise-owner/stock"
            title="Depo & sipariş"
            description={lowStockHint}
            accent="teal"
            icon="DP"
          />
        </BentoCell>
        <BentoCell>
          <BentoActionLink
            href="/franchise-owner/brand"
            title="Markamı düzenle"
            description="Vitrin ve yatırım bilgileri"
            accent="rose"
            icon="MK"
          />
        </BentoCell>

        {recentApps.length > 0 ? (
          <BentoCell span="3">
            <h3 className="text-sm font-semibold">Son gelenler</h3>
            <ul className="mt-3 space-y-2">
              {recentApps.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-0"
                >
                  <span className="text-sm text-[var(--muted-foreground)]">Başvuru #{a.id}</span>
                  <div className="flex items-center gap-2">
                    <StatusPill status={a.status} />
                    <Link
                      href={
                        a.status === "approved"
                          ? `/franchise-owner/messages/${a.id}`
                          : `/franchise-owner/applications/${a.id}`
                      }
                      className="text-xs text-[var(--primary-hover)] underline"
                    >
                      {a.status === "approved" ? "Mesaj" : "Bak"}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </BentoCell>
        ) : null}

        {!applicationsQuery.isError && recentApps.length === 0 && s?.has_brand ? (
          <BentoCell span="3">
            <EmptyState
              icon="—"
              title="Henüz başvuru yok"
              description="Markanız vitrinde göründükçe adaylar buradan başvuracak."
              action={
                <Link href="/franchise-owner/brand" className="btn btn-secondary btn-sm">
                  Markayı güncelle
                </Link>
              }
            />
          </BentoCell>
        ) : null}
      </BentoGrid>
      <FranchiseOwnerTour />
    </div>
  );
}
