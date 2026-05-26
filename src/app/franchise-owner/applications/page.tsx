"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getMyBrandApplications, updateApplicationStatus } from "@/lib/api";
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

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-50">Başvurular</h2>
      <p className="mt-2 text-sm text-slate-400">
        Markanıza gelen franchise başvurularını inceleyin; onaylayın veya reddedin. Adayla mesaj için başvuruya girin.
      </p>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <label className="text-xs font-medium text-slate-400">Durum</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="mt-1 block rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylı</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
        <div className="min-w-[12rem] flex-1">
          <label className="text-xs font-medium text-slate-400">Ara (no, not, marka #)</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="örn. 12 veya ankara"
            className="mt-1 w-full rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
          />
        </div>
        <p className="text-xs text-slate-500 sm:ml-auto">
          {filteredApps.length} / {apps.length} kayıt
        </p>
      </div>

      {applicationsQuery.isLoading ? (
        <p className="mt-6 text-sm text-slate-400">Yükleniyor…</p>
      ) : null}
      {applicationsQuery.isError ? (
        <p className="mt-6 text-sm text-red-400">Liste alınamadı.</p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {filteredApps.map((app) => (
          <li
            key={app.id}
            className="rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-50">Başvuru #{app.id}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Durum:{" "}
                  <span className="font-medium text-cyan-300">
                    {statusLabel[app.status] ?? app.status}
                  </span>
                  {app.brand_id != null ? ` · Marka #${app.brand_id}` : null}
                  {app.created_at ? ` · ${app.created_at}` : null}
                </p>
                {app.notes ? (
                  <p className="mt-2 text-sm text-slate-300">Not: {app.notes}</p>
                ) : null}
              </div>
              <Link
                href={`/franchise-owner/applications/${app.id}`}
                className="shrink-0 rounded-xl border border-slate-500/35 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-cyan-400/45"
              >
                Mesajlar
              </Link>
            </div>

            {app.status === "pending" ? (
              <div className="mt-4 border-t border-slate-500/20 pt-4">
                <label className="text-xs font-medium text-slate-300">Karar notu (isteğe bağlı)</label>
                <textarea
                  value={notesById[app.id] ?? ""}
                  onChange={(e) =>
                    setNotesById((prev) => ({ ...prev, [app.id]: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full max-w-xl rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
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
        ))}
      </ul>

      {!applicationsQuery.isLoading && apps.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Henüz başvuru yok.</p>
      ) : null}
      {!applicationsQuery.isLoading && apps.length > 0 && filteredApps.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Filtre veya arama sonucu eşleşmedi.</p>
      ) : null}

      {feedback ? (
        <p className="mt-4 rounded-xl border border-slate-500/30 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
