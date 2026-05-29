"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BentoActionLink } from "@/components/interaction/bento-action-link";
import { BentoCell, BentoGrid } from "@/components/interaction/bento-grid";
import { MagneticButton } from "@/components/interaction/magnetic-button";
import { SkeletonBento } from "@/components/interaction/skeleton";
import { EmptyState, HelpBox, StatusPill } from "@/components/ui/simple-blocks";
import { getBuyerApplications, getBuyerDashboardSummary } from "@/lib/api";
import { APPLICATION_STATUS_HINT } from "@/lib/routes";

export default function BuyerHomePage() {
  const summaryQuery = useQuery({
    queryKey: ["buyer-dashboard-summary"],
    queryFn: () => getBuyerDashboardSummary(),
  });

  const appsQuery = useQuery({
    queryKey: ["buyer-applications"],
    queryFn: () => getBuyerApplications(),
    retry: false,
  });

  const loading = summaryQuery.isLoading || appsQuery.isLoading;
  const apps = appsQuery.data ?? [];
  const hasApplications = apps.length > 0;
  const pendingApp = apps.find((a) => a.status === "pending");
  const approvedApp = apps.find((a) => a.status === "approved");
  const s = summaryQuery.data;

  if (loading) {
    return <SkeletonBento />;
  }

  if (appsQuery.isSuccess && hasApplications) {
    const focusApp = approvedApp ?? pendingApp ?? apps[0];
    const isBayi = Boolean(approvedApp);
    const pendingCount = apps.filter((a) => a.status === "pending").length;

    return (
      <BentoGrid>
        <BentoCell span="2" className="flex flex-col justify-center">
          <p className="bento-hero-title">{isBayi ? "Bayi hesabınız" : "Başvurunuz devam ediyor"}</p>
          <p className="bento-hero-sub">
            {focusApp
              ? (APPLICATION_STATUS_HINT[focusApp.status] ?? "Başvurum sayfasından takip edin.")
              : "Marka sizinle iletişime geçecek."}
          </p>
        </BentoCell>

        {focusApp ? (
          <BentoCell className="flex flex-col justify-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Başvuru #{focusApp.id}
            </p>
            <StatusPill status={focusApp.status} />
            <MagneticButton strength={0.18}>
              <Link href={`/buyer/applications/${focusApp.id}`} className="btn btn-primary btn-sm w-fit">
                Mesajlara bak
              </Link>
            </MagneticButton>
          </BentoCell>
        ) : null}

        <BentoCell>
          <BentoActionLink
            href="/buyer/applications"
            title="Başvurum"
            description="Tüm başvurularınız ve mesajlar"
            accent="gold"
            icon="BA"
            badge={pendingCount || undefined}
          />
        </BentoCell>

        <BentoCell span="2">
          <BentoActionLink
            href="/buyer/discover"
            title="Başka marka ara"
            description="Yeni fırsatlara göz atın — ⌘K ile hızlı arama"
            accent="teal"
            icon="AR"
          />
        </BentoCell>
      </BentoGrid>
    );
  }

  return (
    <BentoGrid>
      <BentoCell span="2" className="flex flex-col justify-center">
        <p className="bento-hero-title">Hoş geldiniz</p>
        <p className="bento-hero-sub">
          Size uygun franchise markasını bulalım — birkaç dakika sürer.
        </p>
      </BentoCell>

      <BentoCell className="flex flex-col justify-center">
        <MagneticButton>
          <Link href="/buyer/discover" className="btn btn-primary w-full text-center">
            Marka bul
          </Link>
        </MagneticButton>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">veya ⌘K ile ara</p>
      </BentoCell>

      {summaryQuery.isError ? (
        <BentoCell span="3">
          <p className="alert alert-error">Özet yüklenemedi.</p>
        </BentoCell>
      ) : null}

      <BentoCell span="3">
        <HelpBox>
          Henüz başvuru yok. Markaları inceleyin, beğendiğinize başvurun — sonrasında süreci buradan
          takip edersiniz.
        </HelpBox>
      </BentoCell>

      <BentoCell span="2">
        <BentoActionLink
          href="/buyer/discover"
          title="Marka bul"
          description="Sektör, şehir ve bütçeye göre arayın"
          accent="gold"
          icon="KE"
        />
      </BentoCell>

      {s && (s.favorites_count ?? 0) > 0 ? (
        <BentoCell>
          <BentoActionLink
            href="/buyer/discover?tab=favori"
            title="Favorilerim"
            description={`${s.favorites_count} marka kayıtlı`}
            accent="rose"
            icon="FV"
          />
        </BentoCell>
      ) : (
        <BentoCell className="flex flex-col justify-center">
          <p className="bento-metric-label">İpucu</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Spotlight ile &quot;500 bin TL altı gıda&quot; yazarak arayın.
          </p>
        </BentoCell>
      )}

      {!hasApplications && !appsQuery.isError ? (
        <BentoCell span="3">
          <EmptyState
            icon="01"
            title="İlk adım: marka seçin"
            description="Beğendiğiniz markaya başvurduğunuzda bu sayfa başvuru takibine döner."
            action={
              <MagneticButton>
                <Link href="/buyer/discover" className="btn btn-primary">
                  Markalara bak
                </Link>
              </MagneticButton>
            }
          />
        </BentoCell>
      ) : null}
    </BentoGrid>
  );
}
