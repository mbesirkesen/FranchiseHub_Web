"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { getFranchiseDashboardSummary, getMyBrandApplications } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylı",
  rejected: "Reddedildi",
};

function parseAppDate(a: Application): number {
  if (!a.created_at) {
    return 0;
  }
  const ms = Date.parse(a.created_at);
  return Number.isFinite(ms) ? ms : 0;
}

export default function FranchiseOwnerHomePage() {
  const summaryQuery = useQuery({
    queryKey: ["franchise-dashboard-summary"],
    queryFn: () => getFranchiseDashboardSummary(),
    retry: false,
  });

  const applicationsQuery = useQuery({
    queryKey: ["franchise-applications"],
    queryFn: () => getMyBrandApplications(),
  });

  const apps = applicationsQuery.data ?? [];
  const recentApps = useMemo(() => {
    return [...apps].sort((a, b) => parseAppDate(b) - parseAppDate(a)).slice(0, 5);
  }, [apps]);

  const fallbackPending = apps.filter((a) => a.status === "pending").length;
  const fallbackApproved = apps.filter((a) => a.status === "approved").length;
  const fallbackRejected = apps.filter((a) => a.status === "rejected").length;

  const s = summaryQuery.data;
  const useSummary = summaryQuery.isSuccess && s;
  const pending = useSummary ? s.pending_applications : fallbackPending;
  const approved = useSummary ? s.approved_applications : fallbackApproved;
  const rejected = useSummary ? s.rejected_applications : fallbackRejected;
  const total = useSummary ? s.total_applications : apps.length;

  const metricsLoading = summaryQuery.isLoading && applicationsQuery.isLoading;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-50">Özet</h2>
      <p className="mt-2 text-sm text-slate-400">
        Kartlar{" "}
        <code className="rounded bg-slate-950/60 px-1 text-cyan-300/90">GET /franchise-owner/dashboard/summary</code>{" "}
        ile doldurulur; uç hata verirse başvuru sayıları liste üzerinden yedeklenir.
      </p>

      {summaryQuery.isSuccess && s && s.has_brand && s.brand_name ? (
        <p className="mt-3 text-sm text-slate-300">
          Bağlı marka: <span className="font-medium text-slate-100">{s.brand_name}</span>
          {s.brand_id != null ? ` (id: ${s.brand_id})` : null}
        </p>
      ) : null}

      {summaryQuery.isSuccess && s && !s.has_brand ? (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          Özette marka yok görünüyor.{" "}
          <Link href="/franchise-owner/brand" className="font-medium text-cyan-300 underline">
            Marka oluştur
          </Link>
        </div>
      ) : null}

      {summaryQuery.isError ? (
        <p className="mt-4 text-sm text-amber-400/90">
          Özet ucu yanıt vermedi; başvuru sayıları yalnızca liste verisinden hesaplanıyor. Envanter ve tedarik sayıları için
          backend’i kontrol edin.
        </p>
      ) : null}

      {!metricsLoading && !summaryQuery.isError && pending > 0 ? (
        <div className="mt-6 rounded-xl border border-cyan-400/35 bg-cyan-950/25 px-4 py-3 text-sm text-cyan-100">
          <p className="font-medium text-cyan-50">
            {pending} bekleyen başvuru var — incelemek için başvurular sayfasına gidin.
          </p>
          <Link href="/franchise-owner/applications" className="mt-2 inline-block text-xs text-cyan-300 underline">
            Başvurulara git
          </Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Bekleyen</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">{metricsLoading ? "…" : pending}</p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Onaylanan</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">{metricsLoading ? "…" : approved}</p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reddedilen</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">{metricsLoading ? "…" : rejected}</p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Toplam başvuru</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">{metricsLoading ? "…" : total}</p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Envanter kalemi</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {summaryQuery.isSuccess && s ? s.inventory_item_count : summaryQuery.isLoading ? "…" : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tedarik (toplam)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {summaryQuery.isSuccess && s ? s.supply_request_total : summaryQuery.isLoading ? "…" : "—"}
          </p>
          {summaryQuery.isSuccess && s && s.supply_requests_pending > 0 ? (
            <p className="mt-1 text-xs text-slate-500">{s.supply_requests_pending} beklemede</p>
          ) : null}
        </div>
      </div>

      {applicationsQuery.isError ? (
        <p className="mt-4 text-sm text-red-400">
          Başvuru listesi yüklenemedi. Oturum ve backend bağlantısını kontrol edin.
        </p>
      ) : null}

      {!applicationsQuery.isLoading && !applicationsQuery.isError && recentApps.length > 0 ? (
        <div className="mt-8 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-100">Son başvurular</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {recentApps.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-500/15 pb-2 last:border-0"
              >
                <span>
                  #{a.id} · {statusLabel[a.status] ?? a.status}
                  {a.created_at ? ` · ${a.created_at}` : ""}
                </span>
                <Link
                  href={`/franchise-owner/applications/${a.id}`}
                  className="text-xs text-cyan-300 hover:text-cyan-200"
                >
                  Mesaj
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/franchise-owner/brand"
          className="rounded-xl border border-violet-400/40 bg-violet-950/30 px-4 py-2.5 text-sm font-medium text-violet-100 transition hover:border-violet-300/60"
        >
          Marka profili
        </Link>
        <Link
          href="/franchise-owner/applications"
          className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:scale-[1.02]"
        >
          Başvurular
        </Link>
        <Link
          href="/franchise-owner/reports"
          className="rounded-xl border border-slate-500/35 bg-slate-950/35 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40"
        >
          Raporlar
        </Link>
        <Link
          href="/franchise-owner/inventory"
          className="rounded-xl border border-slate-500/35 bg-slate-950/35 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40"
        >
          Envanter
        </Link>
        <Link
          href="/franchise-owner/supply"
          className="rounded-xl border border-slate-500/35 bg-slate-950/35 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40"
        >
          Tedarik
        </Link>
      </div>
    </div>
  );
}
