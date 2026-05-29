"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ExportMenu } from "@/components/ui/export-menu";
import { getConversations, getMyBrandApplications, updateApplicationStatus } from "@/lib/api";
import { downloadCsv, printTableAsPdf } from "@/lib/export-utils";
import { Application, ApplicationStatus } from "@/lib/types";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylı",
  rejected: "Reddedildi",
};

type StatusFilter = "all" | ApplicationStatus;

export default function FranchiseApplicationsPage() {
  const queryClient = useQueryClient();
  const [notesById, setNotesById] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const applicationsQuery = useQuery({
    queryKey: ["franchise-applications"],
    queryFn: () => getMyBrandApplications(),
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: "approved" | "rejected";
      notes?: string;
    }) => updateApplicationStatus(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-applications"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
      setFeedback("Başvuru güncellendi.");
    },
    onError: () => {
      setFeedback("İşlem başarısız oldu.");
    },
  });

  const apps = applicationsQuery.data ?? [];
  const conversationByAppId = new Map(
    (conversationsQuery.data ?? []).map((c) => [c.application_id, c]),
  );

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      const idMatch = String(app.id).includes(q);
      const notes = (app.notes ?? "").toLowerCase();
      const notesMatch = notes.includes(q);
      const brandMatch = app.brand_id != null && String(app.brand_id).includes(q);
      return idMatch || notesMatch || brandMatch;
    });
  }, [apps, statusFilter, search]);

  const exportApplications = () => {
    const headers = ["Başvuru No", "Durum", "Marka ID", "Aday", "Not", "Tarih"];
    const rows = filteredApps.map((app) => {
      const conv = conversationByAppId.get(app.id);
      return [
        String(app.id),
        statusLabel[app.status] ?? app.status,
        app.brand_id != null ? String(app.brand_id) : "",
        conv?.buyer_name ?? "",
        app.notes ?? "",
        app.created_at ?? "",
      ];
    });
    return { headers, rows };
  };

  const exportCsv = () => {
    const { headers, rows } = exportApplications();
    downloadCsv(`franchisehub-basvurular-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const exportPdf = () => {
    const { headers, rows } = exportApplications();
    printTableAsPdf("Başvurular", headers, rows);
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="page-title">Başvurular</h2>
          <p className="page-desc">
            Markanıza gelen franchise başvurularını inceleyin; onaylayın veya reddedin. Mesajlaşma yalnızca onaylı başvurularda açılır.
          </p>
        </div>
        <ExportMenu
          disabled={filteredApps.length === 0}
          onExportCsv={exportCsv}
          onExportPdf={exportPdf}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4 card-muted p-4 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <label className="text-xs font-medium text-[var(--muted)]">Durum</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="mt-1 block input"
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylı</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
        <div className="min-w-[12rem] flex-1">
          <label className="text-xs font-medium text-[var(--muted)]">İsim, başvuru no veya kelime ile ara…</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Örn. başvuru numarası, ad veya şehir"
            className="mt-1 w-full input"
          />
        </div>
        <p className="text-xs text-[var(--muted)] sm:ml-auto">
          {filteredApps.length} / {apps.length} kayıt
        </p>
      </div>

      {applicationsQuery.isLoading ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>
      ) : null}
      {applicationsQuery.isError ? (
        <p className="mt-6 text-[var(--danger)]">Liste alınamadı.</p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {filteredApps.map((app) => {
          const conv = conversationByAppId.get(app.id);
          const canMessage = app.status === "approved";

          return (
          <li
            key={app.id}
            className="card-muted p-4 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Başvuru #{app.id}
                  {conv?.buyer_name ? ` · ${conv.buyer_name}` : ""}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Durum:{" "}
                  <span className="font-medium text-[var(--primary-hover)]">
                    {statusLabel[app.status] ?? app.status}
                  </span>
                  {app.brand_id != null ? ` · Marka #${app.brand_id}` : null}
                  {app.created_at ? ` · ${app.created_at}` : null}
                </p>
                {conv?.last_message ? (
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                    Son mesaj: {conv.last_message.content}
                  </p>
                ) : null}
                {app.notes ? (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Not: {app.notes}</p>
                ) : null}
              </div>
              <Link
                href={
                  canMessage
                    ? `/franchise-owner/messages/${app.id}`
                    : `/franchise-owner/applications/${app.id}`
                }
                className={`shrink-0 btn btn-sm ${canMessage ? "btn-primary" : ""}`}
              >
                {canMessage ? (
                  <>
                    Mesajlar
                    {(conv?.unread_count ?? 0) > 0 ? ` (${conv!.unread_count})` : ""}
                  </>
                ) : (
                  "Detay"
                )}
              </Link>
            </div>

            {app.status === "pending" ? (
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Karar notu (isteğe bağlı)</label>
                <textarea
                  value={notesById[app.id] ?? ""}
                  onChange={(e) =>
                    setNotesById((prev) => ({ ...prev, [app.id]: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full max-w-xl input"
                  placeholder="Adaya iletilecek kısa gerekçe…"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        id: app.id,
                        status: "approved",
                        notes: notesById[app.id] || undefined,
                      })
                    }
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        id: app.id,
                        status: "rejected",
                        notes: notesById[app.id] || undefined,
                      })
                    }
                    className="rounded-xl border border-red-400/50 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-950/60 disabled:opacity-60"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ) : null}
          </li>
          );
        })}
      </ul>

      {!applicationsQuery.isLoading && apps.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Henüz başvuru yok.</p>
      ) : null}
      {!applicationsQuery.isLoading && apps.length > 0 && filteredApps.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Filtre veya arama sonucu eşleşmedi.</p>
      ) : null}

      {feedback ? (
        <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--foreground)]">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
