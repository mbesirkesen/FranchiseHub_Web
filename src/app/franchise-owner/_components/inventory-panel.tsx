"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExportMenu } from "@/components/ui/export-menu";
import { HelpBox } from "@/components/ui/simple-blocks";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  getLowStockInventory,
  getOutlets,
  updateInventoryItem,
} from "@/lib/api";
import { downloadCsv, printTableAsPdf } from "@/lib/export-utils";
import { InventoryItem } from "@/lib/types";

function invalidateInventoryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["inventory"] });
  queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
  queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
}

export function InventoryPanel() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");

  const inventoryQuery = useQuery({
    queryKey: ["inventory", "center"],
    queryFn: () => getInventory({ scope: "center" }),
  });

  const outletInventoryQuery = useQuery({
    queryKey: ["inventory", "outlet"],
    queryFn: () => getInventory({ scope: "outlet" }),
  });

  const outletsQuery = useQuery({
    queryKey: ["outlets"],
    queryFn: () => getOutlets(),
  });

  const lowStockQuery = useQuery({
    queryKey: ["inventory-low-stock", "center"],
    queryFn: () => getLowStockInventory(10, "center"),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createInventoryItem({
        product_name: productName.trim(),
        quantity: quantity === "" ? 0 : Number(quantity),
        outlet_id: null,
      }),
    onSuccess: () => {
      setProductName("");
      setQuantity("");
      setFeedback("Ürün merkez deposuna eklendi.");
      invalidateInventoryQueries(queryClient);
    },
    onError: () => setFeedback("Eklenemedi — tekrar deneyin."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      updateInventoryItem(id, payload),
    onSuccess: () => {
      setEditingId(null);
      setEditQty("");
      setFeedback("Merkez stok miktarı güncellendi.");
      invalidateInventoryQueries(queryClient);
    },
    onError: () => setFeedback("Güncellenemedi."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      setFeedback("Ürün merkez deposundan kaldırıldı.");
      invalidateInventoryQueries(queryClient);
    },
    onError: () => setFeedback("Silinemedi."),
  });

  const items = inventoryQuery.data ?? [];
  const outletItems = outletInventoryQuery.data ?? [];
  const lowStock = lowStockQuery.data ?? [];

  const outletNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const outlet of outletsQuery.data ?? []) {
      map.set(outlet.id, outlet.name);
    }
    return map;
  }, [outletsQuery.data]);

  const exportRows = () => {
    const headers = ["ID", "Ürün", "Miktar", "SKU", "Birim"];
    const rows = items.map((item) => [
      String(item.id),
      item.product_name ?? "",
      item.quantity != null ? String(item.quantity) : "",
      item.sku ?? "",
      item.unit ?? "",
    ]);
    return { headers, rows };
  };

  return (
    <div>
      <HelpBox>
        Merkez deposu, sevkiyat kaynağınızdır. Bayi talebi yola çıktığında ürün buradan düşer ve ilgili şubenin
        stoğuna eklenir. Ürün adını bayi talepleriyle birebir aynı yazın (ör. “marul”, “Marul” aynı kabul edilir).
      </HelpBox>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="card flex-1 p-4">
          <h3 className="text-sm font-semibold">Merkez deposuna ürün ekle</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Sevkiyat öncesi merkez stokunu buradan tanımlayın.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Ürün adı</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ürün adı"
                className="mt-1 block w-full input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Adet</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-24 input"
              />
            </div>
            <button
              type="button"
              disabled={createMutation.isPending || !productName.trim()}
              onClick={() => createMutation.mutate()}
              className="btn btn-primary btn-sm disabled:opacity-50"
            >
              Ekle
            </button>
          </div>
        </div>
        <ExportMenu
          disabled={items.length === 0}
          onExportCsv={() => {
            const { headers, rows } = exportRows();
            downloadCsv(`franchisehub-merkez-depo-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
          }}
          onExportPdf={() => {
            const { headers, rows } = exportRows();
            printTableAsPdf("Merkez deposu", headers, rows);
          }}
        />
      </div>

      {inventoryQuery.isLoading ? <p className="mt-6 text-sm text-[var(--muted-foreground)]">Yükleniyor…</p> : null}
      {inventoryQuery.isError ? <p className="mt-6 alert alert-error">Depo listesi alınamadı.</p> : null}

      <h3 className="mt-6 text-sm font-semibold">Merkez stok listesi</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{item.product_name ?? `Ürün #${item.id}`}</p>
              <p className="text-xs text-[var(--muted)]">Stokta: {item.quantity ?? "—"} adet</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editingId === item.id ? (
                <>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-20 input"
                  />
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: item.id,
                        payload: { quantity: editQty === "" ? 0 : Number(editQty) },
                      })
                    }
                    className="btn btn-primary btn-sm"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditQty("");
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Vazgeç
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditQty(String(item.quantity ?? ""));
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Miktar değiştir
                </button>
              )}
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(item.id)}
                className="btn btn-ghost btn-sm text-[var(--danger)]"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!inventoryQuery.isLoading && items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">Merkez deposu boş — sevkiyat için önce ürün ekleyin.</p>
      ) : null}

      {lowStock.length > 0 ? (
        <div className="mt-6 help-box">
          <p className="font-semibold text-[var(--foreground)]">Merkezde azalan stok</p>
          <ul className="mt-2 space-y-1 text-sm">
            {lowStock.map((it: InventoryItem) => (
              <li key={it.id}>
                {it.product_name ?? `#${it.id}`} — {it.quantity ?? 0} adet kaldı
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 card p-4">
        <h3 className="text-sm font-semibold">Şube stokları</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Sevkiyat sonrası bayi şubelerine işlenen stok — salt okunur.</p>
        {outletInventoryQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>
        ) : null}
        {outletItems.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {outletItems.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm"
              >
                <p className="font-medium">{item.product_name ?? `Ürün #${item.id}`}</p>
                <p className="text-xs text-[var(--muted)]">
                  {item.quantity ?? "—"} adet ·{" "}
                  {item.outlet_id != null
                    ? (outletNames.get(item.outlet_id) ?? `Şube #${item.outlet_id}`)
                    : "Şube"}
                </p>
              </li>
            ))}
          </ul>
        ) : !outletInventoryQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Henüz şube stoğu yok.</p>
        ) : null}
      </div>

      {feedback ? <p className="mt-4 alert">{feedback}</p> : null}
    </div>
  );
}
