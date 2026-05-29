"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getFranchiseAnalytics, getInventory, getOutlets } from "@/lib/api";
import { downloadCsv } from "@/lib/export-utils";
import { InventoryItem } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;

export default function FranchiseReportsPage() {
  const [threshold, setThreshold] = useState(String(LOW_STOCK_THRESHOLD));

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
  });

  const analyticsQuery = useQuery({
    queryKey: ["franchise-analytics"],
    queryFn: () => getFranchiseAnalytics(),
    retry: false,
  });

  const outletsQuery = useQuery({
    queryKey: ["outlets"],
    queryFn: () => getOutlets(),
    retry: false,
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
      <h2 className="page-title">Raporlar</h2>
      <p className="page-desc">
        Envanter özetinizi ve düşük stok uyarılarını tek ekranda takip edin; şube bazlı raporlar yakında eklenecek.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="metric-card backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]0">Kalem sayısı (SKU)</p>
          <p className="metric-value">
            {inventoryQuery.isLoading ? "…" : stats.totalSkus}
          </p>
        </div>
        <div className="metric-card backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]0">Toplam miktar</p>
          <p className="metric-value">
            {inventoryQuery.isLoading ? "…" : stats.sumQty}
          </p>
        </div>
        <div className="metric-card backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]0">Düşük stok (&lt; eşik)</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">
            {inventoryQuery.isLoading ? "…" : stats.lowStock.length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4 card-muted p-4 backdrop-blur-sm">
        <div>
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Düşük stok eşiği</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-1 w-28 input"
          />
        </div>
        <button
          type="button"
          disabled={inventoryQuery.isLoading || items.length === 0}
          onClick={exportInventory}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)]/30 disabled:opacity-50"
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
        <p className="mt-6 text-[var(--danger)]">Envanter alınamadı; rapor kısmen boş.</p>
      ) : null}

      {analyticsQuery.data ? (
        <div className="mt-8 card-muted p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Analitik özet</h3>
          <p className="page-desc">
            Toplam envanter miktarı: {analyticsQuery.data.inventory_total_quantity ?? 0}
          </p>
          {Object.keys(analyticsQuery.data.supply_requests_by_status ?? {}).length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
              {Object.entries(analyticsQuery.data.supply_requests_by_status ?? {}).map(([k, v]) => (
                <li key={k}>
                  Tedarik {k}: {v}
                </li>
              ))}
            </ul>
          ) : null}
          {(analyticsQuery.data.applications_by_month ?? []).length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
              {(analyticsQuery.data.applications_by_month ?? []).map((m) => (
                <li key={m.month}>
                  {m.month}: {m.count} başvuru
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : analyticsQuery.isError ? (
        <p className="mt-6 text-[var(--danger)]">Analitik verisi yüklenemedi.</p>
      ) : null}

      <div className="mt-8 rounded-xl bg-[var(--border)] border bg-[var(--bg-subtle)] p-5 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Şubeler</h3>
        {outletsQuery.data && outletsQuery.data.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
            {outletsQuery.data.map((o) => (
              <li key={o.id}>
                {o.name} — {o.city ?? "—"} ({o.is_active === false ? "pasif" : "aktif"})
              </li>
            ))}
          </ul>
        ) : (
          <p className="page-desc">
            Henüz kayıtlı şube görünmüyor. Şubelerinizi eklemek ve yönetmek için{" "}
            <a href="/franchise-owner/outlets" className="font-medium text-[var(--primary-hover)] underline-offset-2 hover:underline">
              Şubeler
            </a>{" "}
            sayfasını kullanın.
          </p>
        )}
      </div>
    </div>
  );
}
