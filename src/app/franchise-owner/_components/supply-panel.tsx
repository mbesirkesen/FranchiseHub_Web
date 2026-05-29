"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createBulkSupplyRequest, getMySupplyRequests, getSupplyPool, updateSupplyRequest } from "@/lib/api";
import { SUPPLY_STATUS_LABEL } from "@/lib/routes";
import { SupplyRequest, SupplyRequestStatus } from "@/lib/types";

export function SupplyPanel() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lines, setLines] = useState([{ product_name: "", quantity: "" }]);

  const poolQuery = useQuery({ queryKey: ["supply-pool"], queryFn: () => getSupplyPool() });
  const myRequestsQuery = useQuery({ queryKey: ["supply-requests"], queryFn: () => getMySupplyRequests() });

  const bulkMutation = useMutation({
    mutationFn: () =>
      createBulkSupplyRequest({
        requests: lines
          .map((l) => ({
            product_name: l.product_name.trim(),
            quantity: l.quantity === "" ? 0 : Number(l.quantity),
          }))
          .filter((l) => l.product_name.length > 0),
      }),
    onSuccess: () => {
      setLines([{ product_name: "", quantity: "" }]);
      setFeedback("Siparişiniz gönderildi — onay bekleyin.");
      queryClient.invalidateQueries({ queryKey: ["supply-pool"] });
      queryClient.invalidateQueries({ queryKey: ["supply-requests"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: () => setFeedback("Gönderilemedi — tekrar deneyin."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: SupplyRequestStatus }) =>
      updateSupplyRequest(id, { status }),
    onSuccess: () => {
      setFeedback("Durum güncellendi.");
      queryClient.invalidateQueries({ queryKey: ["supply-requests"] });
    },
    onError: () => setFeedback("Durum güncellenemedi."),
  });

  const poolList = poolQuery.data ?? [];
  const myList = myRequestsQuery.data ?? [];

  const addLine = () => setLines((prev) => [...prev, { product_name: "", quantity: "" }]);
  const updateLine = (i: number, field: "product_name" | "quantity", value: string) => {
    setLines((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const submitBulk = () => {
    if (!lines.some((l) => l.product_name.trim().length > 0)) {
      setFeedback("En az bir ürün yazın.");
      return;
    }
    bulkMutation.mutate();
  };

  return (
    <div>
      <div className="card p-4">
        <h3 className="text-sm font-semibold">Malzeme siparişi ver</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Ne lazım? Adet yazın, gönderin.</p>
        <div className="mt-4 space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <input
                value={line.product_name}
                onChange={(e) => updateLine(i, "product_name", e.target.value)}
                placeholder="Ürün adı"
                className="min-w-[12rem] flex-1 input"
              />
              <input
                type="number"
                value={line.quantity}
                onChange={(e) => updateLine(i, "quantity", e.target.value)}
                placeholder="Adet"
                className="w-24 input"
              />
              {lines.length > 1 ? (
                <button type="button" onClick={() => removeLine(i)} className="btn btn-ghost btn-sm">
                  Kaldır
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={addLine} className="btn btn-secondary btn-sm">
            + Bir ürün daha
          </button>
          <button type="button" disabled={bulkMutation.isPending} onClick={submitBulk} className="btn btn-primary btn-sm">
            Siparişi gönder
          </button>
        </div>
      </div>

      <div className="mt-6 card p-4">
        <h3 className="text-sm font-semibold">Siparişlerim</h3>
        {myRequestsQuery.isLoading ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">Yükleniyor…</p> : null}
        <ul className="mt-3 space-y-2">
          {myList.map((entry) => (
            <SupplyRow key={entry.id} entry={entry} onStatus={(status) => statusMutation.mutate({ id: entry.id, status })} />
          ))}
        </ul>
        {!myRequestsQuery.isLoading && myList.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Henüz sipariş yok.</p>
        ) : null}
      </div>

      {poolList.length > 0 ? (
        <div className="mt-6 card p-4">
          <h3 className="text-sm font-semibold">Ortak sipariş havuzu</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Diğer bayilerin talepleri — referans için</p>
          <ul className="mt-3 space-y-2">
            {poolList.map((entry, idx) => (
              <li key={entry.id ?? idx} className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-xs">
                {entry.product_name ?? `#${entry.id}`} · {entry.quantity ?? "—"} adet ·{" "}
                {SUPPLY_STATUS_LABEL[entry.status ?? "pending"] ?? entry.status}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 alert">{feedback}</p> : null}
    </div>
  );
}

function SupplyRow({
  entry,
  onStatus,
}: {
  entry: SupplyRequest;
  onStatus: (s: SupplyRequestStatus) => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm">
      <span>
        {entry.product_name ?? "—"} · {entry.quantity ?? "—"} adet ·{" "}
        <strong>{SUPPLY_STATUS_LABEL[entry.status ?? "pending"] ?? entry.status}</strong>
      </span>
      <select
        defaultValue={entry.status ?? "pending"}
        onChange={(e) => onStatus(e.target.value as SupplyRequestStatus)}
        className="input"
      >
        <option value="pending">Bekliyor</option>
        <option value="approved">Onaylandı</option>
        <option value="shipped">Yolda</option>
        <option value="rejected">Reddedildi</option>
      </select>
    </li>
  );
}
