"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { ApplicationTimeline } from "@/components/buyer/application-timeline";
import { BentoActionLink } from "@/components/interaction/bento-action-link";
import { BentoCell, BentoGrid } from "@/components/interaction/bento-grid";
import { BentoMetricCell } from "@/components/interaction/bento-metric-cell";
import { MagneticButton } from "@/components/interaction/magnetic-button";
import { SkeletonBento } from "@/components/interaction/skeleton";
import { EmptyState, HelpBox, StatusPill } from "@/components/ui/simple-blocks";
import { getBuyerApplications, getBuyerDashboardSummary, getConversations } from "@/lib/api";
import { APPLICATION_STATUS_HINT } from "@/lib/routes";
import { Application, ConversationItem } from "@/lib/types";

function appBrandLabel(app: Application, conv?: ConversationItem): string {
  if (conv?.brand_name) return conv.brand_name;
  if (app.brand_id != null) return `Marka #${app.brand_id}`;
  return `Başvuru #${app.id}`;
}

function heroTitle(approvedCount: number, hasPending: boolean): string {
  if (approvedCount > 1) return `${approvedCount} aktif bayilik`;
  if (approvedCount === 1) return "Bayi hesabınız";
  if (hasPending) return "Başvurunuz devam ediyor";
  return "Başvurularınız";
}

function heroSubtitle(approvedCount: number, pendingCount: number, focusApp?: Application): string {
  if (approvedCount > 1) {
    return "Her marka için ayrı mesaj ve süreç yürütülür — aşağıdan seçin.";
  }
  if (approvedCount === 1 && pendingCount > 0) {
    return "Onaylı bayiliğiniz aktif; bekleyen başvurularınız da var.";
  }
  if (focusApp) {
    return APPLICATION_STATUS_HINT[focusApp.status] ?? "Başvurum sayfasından takip edin.";
  }
  return "Marka sizinle iletişime geçecek.";
}

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

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    retry: false,
  });

  const loading = summaryQuery.isLoading || appsQuery.isLoading;
  const apps = appsQuery.data ?? [];
  const hasApplications = apps.length > 0;
  const approvedApps = useMemo(() => apps.filter((a) => a.status === "approved"), [apps]);
  const pendingApps = useMemo(() => apps.filter((a) => a.status === "pending"), [apps]);
  const conversationByAppId = useMemo(
    () => new Map((conversationsQuery.data ?? []).map((c) => [c.application_id, c])),
    [conversationsQuery.data],
  );

  const pendingApp = pendingApps[0];
  const focusApp = approvedApps[0] ?? pendingApp ?? apps[0];
  const pendingCount = pendingApps.length;
  const approvedCount = approvedApps.length;
  const s = summaryQuery.data;

  if (loading) {
    return <SkeletonBento />;
  }

  if (appsQuery.isSuccess && hasApplications) {
    return (
      <BentoGrid>
        <BentoCell span="2" className="bento-cell-hero">
          <p className="bento-hero-title">{heroTitle(approvedCount, pendingCount > 0)}</p>
          <p className="bento-hero-sub">
            {heroSubtitle(approvedCount, pendingCount, focusApp)}
          </p>
          {approvedCount <= 1 && focusApp ? (
            <ApplicationTimeline
              status={focusApp.status}
              createdAt={focusApp.created_at}
              variant="bar"
            />
          ) : null}
        </BentoCell>

        {approvedCount > 0 ? (
          <BentoMetricCell
            label="Onaylı bayilik"
            value={approvedCount}
            watermark="✓"
            valueClassName="text-emerald-600"
          />
        ) : pendingCount > 0 ? (
          <BentoCell className="flex flex-col justify-center gap-3 bento-cell-accent">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Başvuru #{pendingApp!.id}
            </p>
            <div className="status-live-wrap">
              <StatusPill status="pending" live />
              <ApplicationTimeline
                status="pending"
                createdAt={pendingApp!.created_at}
                variant="micro"
              />
            </div>
            <MagneticButton strength={0.18}>
              <Link
                href={`/buyer/applications/${pendingApp!.id}`}
                className="btn btn-primary btn-sm w-fit btn-glow"
              >
                Başvuruyu gör
              </Link>
            </MagneticButton>
          </BentoCell>
        ) : null}

        {approvedCount > 1 || (approvedCount === 1 && pendingCount > 0) ? (
          <BentoCell span="3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {approvedCount > 1 ? "Onaylı markalarınız" : "Onaylı markanız"}
            </h3>
            <ul className="mt-3 space-y-2">
              {approvedApps.map((app) => {
                const conv = conversationByAppId.get(app.id);
                const label = appBrandLabel(app, conv);
                const unread = conv?.unread_count ?? 0;

                return (
                  <li
                    key={app.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{label}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Başvuru #{app.id}
                        {unread > 0 ? ` · ${unread} okunmamış mesaj` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/buyer/messages/${app.id}`}
                      className="btn btn-primary btn-sm shrink-0"
                    >
                      Mesajlar{unread > 0 ? ` (${unread})` : ""}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </BentoCell>
        ) : null}

        {approvedCount === 1 && pendingCount === 0 ? (
          <BentoCell className="flex flex-col justify-center gap-3 bento-cell-accent">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {appBrandLabel(focusApp!, conversationByAppId.get(focusApp!.id))}
            </p>
            <StatusPill status="approved" />
            <MagneticButton strength={0.18}>
              <Link
                href={`/buyer/messages/${focusApp!.id}`}
                className="btn btn-primary btn-sm w-fit btn-glow"
              >
                Mesajlara bak
              </Link>
            </MagneticButton>
          </BentoCell>
        ) : null}

        {pendingCount > 0 && approvedCount > 0 ? (
          <BentoCell span="3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Bekleyen başvurular ({pendingCount})
            </h3>
            <ul className="mt-3 space-y-2">
              {pendingApps.map((app) => {
                const conv = conversationByAppId.get(app.id);
                return (
                  <li
                    key={app.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{appBrandLabel(app, conv)}</p>
                      <div className="mt-1">
                        <StatusPill status="pending" live />
                      </div>
                    </div>
                    <Link href={`/buyer/applications/${app.id}`} className="btn btn-secondary btn-sm shrink-0">
                      Detay
                    </Link>
                  </li>
                );
              })}
            </ul>
          </BentoCell>
        ) : null}

        <BentoCell>
          <BentoActionLink
            href="/buyer/applications"
            title="Başvurum"
            description="Tüm başvurularınız ve durumlar"
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
