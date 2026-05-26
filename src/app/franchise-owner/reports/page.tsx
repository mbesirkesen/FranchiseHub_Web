"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getInventory } from "@/lib/api";
import { InventoryItem } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => {
    if (cell.includes('"') || cell.includes(",") || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };
  const body = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FranchiseReportsPage() {
  const [threshold, setThreshold] = useState(String(LOW_STOCK_THRESHOLD));

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
  });

  const items = inventoryQuery.data ?? [];
  const t = threshold === "" ? LOW_STOCK_THRESHOLD : Number(threshold) || LOW_STOCK_THRESHOLD;

  const stats = useMemo(() => {
    const totalSkus = items.length;
    const sumQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
    const lowStock = items.filter((it) => (Number(it.quantity) || 0) < t && (Number(it.quantity) || 0) >= 0);
    return { totalSkus, sumQty, lowStock };
  }, [items, t]);

  const exportInventory = () => {
    const header = ["id", "product_name", "quantity", "sku", "unit"];
    const rows = [
      header,
      ...items.map((it) => [
        String(it.id),
        it.product_name ?? "",
        String(it.quantity ?? ""),
        it.sku ?? "",
        it.unit ?? "",
      ]),
    ];
    downloadCsv(`franchisehub-envanter-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-50">Raporlar</h2>
      <p className="mt-2 text-sm text-slate-400">
        Envanter özetini burada toplayın; şube listesi backend ucu hazır olunca genişletilebilir.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kalem sayısı (SKU)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {inventoryQuery.isLoading ? "…" : stats.totalSkus}
          </p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Toplam miktar</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50">
            {inventoryQuery.isLoading ? "…" : stats.sumQty}
          </p>
        </div>
        <div className="rounded-xl border border-slate-500/25 bg-slate-950/40 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Düşük stok (&lt; eşik)</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">
            {inventoryQuery.isLoading ? "…" : stats.lowStock.length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
        <div>
          <label className="text-xs font-medium text-slate-300">Düşük stok eşiği</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-1 w-28 rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
          />
        </div>
        <button
          type="button"
          disabled={inventoryQuery.isLoading || items.length === 0}
          onClick={exportInventory}
          className="rounded-xl border border-slate-500/35 bg-slate-950/40 px-4 py-2 text-sm font-medium text-slate-100 hover:border-cyan-400/40 disabled:opacity-50"
        >
          Envanteri CSV indir
        </button>
      </div>

      {stats.lowStock.length > 0 ? (
        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-950/15 p-4">
          <h3 className="text-sm font-semibold text-amber-200">Düşük stok kalemleri</h3>
          <ul className="mt-3 space-y-1 text-sm text-amber-100/90">
            {stats.lowStock.map((it) => (
              <li key={it.id}>
                {it.product_name ?? `Ürün #${it.id}`} — {it.quantity ?? 0} adet
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {inventoryQuery.isError ? (
        <p className="mt-6 text-sm text-red-400">Envanter alınamadı; rapor kısmen boş.</p>
      ) : null}

      <div className="mt-8 rounded-xl border border-slate-500/25 bg-slate-950/35 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-50">Şubeler</h3>
        <p className="mt-2 text-sm text-slate-400">
          Çoklu şube raporu için backend&apos;de önerilen uç:{" "}
          <code className="rounded bg-slate-950/60 px-1 text-cyan-300/90">GET /franchise-owner/outlets</code> veya{" "}
          <code className="rounded bg-slate-950/60 px-1 text-cyan-300/90">GET /outlets/my-brand</code>.
          Uç hazır olduğunda bu bölüm listeyle doldurulur.
        </p>
      </div>
    </div>
  );
}
