"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createBulkSupplyRequest, getMySupplyRequests, getSupplyPool } from "@/lib/api";

function formatPoolEntry(entry: unknown, index: number): string {
  if (entry == null) {
    return String(index);
  }
  if (typeof entry === "string") {
    return entry;
  }
  if (typeof entry === "object") {
    return JSON.stringify(entry);
  }
  return String(entry);
}

export default function FranchiseSupplyPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lines, setLines] = useState([{ product_name: "", quantity: "" }]);

  const poolQuery = useQuery({
    queryKey: ["supply-pool"],
    queryFn: () => getSupplyPool(),
  });

  const myRequestsQuery = useQuery({
    queryKey: ["supply-requests"],
    queryFn: () => getMySupplyRequests(),
  });

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
      setFeedback("Tedarik talebi gönderildi.");
      queryClient.invalidateQueries({ queryKey: ["supply-pool"] });
      queryClient.invalidateQueries({ queryKey: ["supply-requests"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: () => setFeedback("Gönderilemedi."),
  });

  const poolList = poolQuery.data ?? [];
  const myList = myRequestsQuery.data ?? [];

  const addLine = () => {
    setLines((prev) => [...prev, { product_name: "", quantity: "" }]);
  };

  const updateLine = (i: number, field: "product_name" | "quantity", value: string) => {
    setLines((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeLine = (i: number) => {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submitBulk = () => {
    const valid = lines.some((l) => l.product_name.trim().length > 0);
    if (!valid) {
      setFeedback("En az bir ürün satırı doldurun.");
      return;
    }
    bulkMutation.mutate();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-50">Tedarik</h2>
      <p className="mt-2 text-sm text-slate-400">
        Kendi talepleriniz{" "}
        <code className="rounded bg-slate-950/60 px-1 text-cyan-300/90">GET /supply-requests</code>, toplu oluşturma{" "}
        <code className="rounded bg-slate-950/60 px-1 text-cyan-300/90">POST /supply-requests/bulk</code>, havuz{" "}
        <code className="rounded bg-slate-950/60 px-1 text-cyan-300/90">GET /supply-requests/pool</code>.
      </p>

      <div className="mt-6 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-50">Taleplerim</h3>
        {myRequestsQuery.isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Yükleniyor…</p>
        ) : null}
        {myRequestsQuery.isError ? (
          <p className="mt-3 text-sm text-red-400">Liste alınamadı.</p>
        ) : null}
        <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
          {myList.map((entry, idx) => (
            <li
              key={idx}
              className="rounded-lg border border-slate-500/25 bg-slate-950/50 px-3 py-2 font-mono text-xs text-slate-300"
            >
              {formatPoolEntry(entry, idx)}
            </li>
          ))}
        </ul>
        {!myRequestsQuery.isLoading && myList.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Henüz talep yok.</p>
        ) : null}
      </div>

      <div className="mt-6 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-50">Toplu talep</h3>
        <div className="mt-4 space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="grow">
                <label className="text-xs font-medium text-slate-300">Ürün</label>
                <input
                  value={line.product_name}
                  onChange={(e) => updateLine(i, "product_name", e.target.value)}
                  className="mt-1 w-full min-w-[12rem] rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
                />
              </div>
              <div className="w-28">
                <label className="text-xs font-medium text-slate-300">Adet</label>
                <input
                  type="number"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
                />
              </div>
              {lines.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline"
                >
                  Kaldır
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addLine}
            className="rounded-xl border border-slate-500/35 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-100 hover:border-cyan-400/40"
          >
            Satır ekle
          </button>
          <button
            type="button"
            disabled={bulkMutation.isPending}
            onClick={submitBulk}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
          >
            {bulkMutation.isPending ? "Gönderiliyor…" : "Talebi gönder"}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-50">Tedarik havuzu</h3>
        {poolQuery.isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Yükleniyor…</p>
        ) : null}
        {poolQuery.isError ? (
          <p className="mt-3 text-sm text-red-400">Havuz alınamadı.</p>
        ) : null}
        <ul className="mt-3 space-y-2">
          {poolList.map((entry, idx) => (
            <li
              key={idx}
              className="rounded-lg border border-slate-500/25 bg-slate-950/50 px-3 py-2 font-mono text-xs text-slate-300"
            >
              {formatPoolEntry(entry, idx)}
            </li>
          ))}
        </ul>
        {!poolQuery.isLoading && poolList.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Havuzda kayıt yok.</p>
        ) : null}
      </div>

      {feedback ? (
        <p className="mt-4 rounded-xl border border-slate-500/30 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
