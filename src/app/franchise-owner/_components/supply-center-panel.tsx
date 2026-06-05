"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { HelpBox } from "@/components/ui/simple-blocks";
import { getIncomingSupplyRequests, updateSupplyRequest } from "@/lib/api";
import { SUPPLY_STATUS_LABEL } from "@/lib/routes";
import { SUPPLY_CENTER_ACTIONS } from "@/lib/supply-status";
import { SupplyRequest, SupplyRequestStatus } from "@/lib/types";

function readApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }
  return "İşlem yapılamadı.";
}

function formatWhen(value?: string | null) {
  if (!value) {
    return "—";
  }
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) {
    return value;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

function statusTone(status: SupplyRequestStatus): string {
  if (status === "approved" || status === "shipped") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "pending") {
    return "bg-amber-100 text-amber-900";
  }
  if (status === "rejected") {
    return "bg-red-100 text-red-800";
  }
  return "bg-[var(--bg-subtle)] text-[var(--foreground)]";
}

export function SupplyCenterPanel() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const requestsQuery = useQuery({
    queryKey: ["supply-requests", "incoming"],
    queryFn: () => getIncomingSupplyRequests(),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: SupplyRequestStatus;
      notes?: string;
    }) => updateSupplyRequest(id, { status, notes }),
    onSuccess: (_data, variables) => {
      if (variables.status === "shipped") {
        setFeedback("Sevkiyat tamam — merkez deposundan düşüldü, bayi şube stoğu güncellendi.");
      } else if (variables.status === "approved") {
        setFeedback("Talep onaylandı.");
      } else if (variables.status === "rejected") {
        setFeedback("Talep reddedildi.");
      } else {
        setFeedback("Durum güncellendi.");
      }
      queryClient.invalidateQueries({ queryKey: ["supply-requests"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: (error) => setFeedback(readApiError(error)),
  });

  const list = (requestsQuery.data ?? []).filter((r) => r.outlet_id != null);
  const actionable = list.filter((r) => r.status === "pending" || r.status === "approved");
  const closed = list.filter((r) => r.status === "shipped" || r.status === "rejected");

  return (
    <div>
      <HelpBox>
        Onaylı bayilerin şubelerinden gelen malzeme talepleri burada listelenir. Onaylayın, reddedin veya sevkiyatı
        başlatın — ürün ilgili şubenin stoğuna işlenir.
      </HelpBox>

      <div className="mt-4 card p-4">
        <h3 className="text-sm font-semibold">Bekleyen talepler</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Onay veya sevkiyat bekleyen bayi talepleri.</p>

        {requestsQuery.isLoading ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">Yükleniyor…</p> : null}
        {requestsQuery.isError ? (
          <p className="mt-3 alert alert-error">Talepler yüklenemedi. Backend güncellemesi gerekebilir.</p>
        ) : null}

        {actionable.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {actionable.map((entry) => (
              <CenterRow
                key={entry.id}
                entry={entry}
                pending={statusMutation.isPending}
                onAction={(status, notes) =>
                  statusMutation.mutate({
                    id: entry.id,
                    status,
                    notes,
                  })
                }
              />
            ))}
          </ul>
        ) : !requestsQuery.isLoading && !requestsQuery.isError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Bekleyen bayi talebi yok. Bayiler, onaylı bayilik sonrası kendi panelinden talep gönderir.
          </p>
        ) : null}
      </div>

      {closed.length > 0 ? (
        <div className="mt-6 card p-4">
          <h3 className="text-sm font-semibold">Tamamlanan talepler</h3>
          <ul className="mt-3 space-y-2">
            {closed.map((entry) => (
              <CompletedRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 alert">{feedback}</p> : null}
    </div>
  );
}

function RequestMeta({ entry }: { entry: SupplyRequest }) {
  const current = entry.status ?? "pending";
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{entry.product_name ?? "—"}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone(current)}`}>
          {SUPPLY_STATUS_LABEL[current] ?? current}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {entry.quantity ?? "—"} adet · Talep #{entry.id}
        {entry.outlet_name ? ` · ${entry.outlet_name}` : ""}
        {entry.buyer_name ? ` · ${entry.buyer_name}` : ""}
      </p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">Gönderim: {formatWhen(entry.created_at)}</p>
    </div>
  );
}

function CenterRow({
  entry,
  pending,
  onAction,
}: {
  entry: SupplyRequest;
  pending: boolean;
  onAction: (status: SupplyRequestStatus, notes?: string) => void;
}) {
  const current = entry.status ?? "pending";
  const actions = SUPPLY_CENTER_ACTIONS[current] ?? [];
  const [notes, setNotes] = useState(entry.notes ?? "");

  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RequestMeta entry={entry} />
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={pending}
              onClick={() => onAction(action.status, notes.trim() || undefined)}
              className={
                action.variant === "primary"
                  ? "btn btn-primary btn-sm"
                  : action.variant === "secondary"
                    ? "btn btn-secondary btn-sm"
                    : "btn btn-ghost btn-sm text-[var(--danger)]"
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium text-[var(--muted-foreground)]">Merkez notu (isteğe bağlı)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Örn: Cuma sevkiyatı"
          className="mt-1 block w-full input"
        />
      </div>
    </li>
  );
}

function CompletedRow({ entry }: { entry: SupplyRequest }) {
  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-3 text-sm">
      <RequestMeta entry={entry} />
      {entry.notes ? <p className="mt-2 text-xs text-[var(--muted)]">Not: {entry.notes}</p> : null}
    </li>
  );
}
