"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  getLowStockInventory,
  updateInventoryItem,
} from "@/lib/api";
import { InventoryItem } from "@/lib/types";

export function InventoryPanel() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
  });

  const lowStockQuery = useQuery({
    queryKey: ["inventory-low-stock"],
    queryFn: () => getLowStockInventory(10),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createInventoryItem({
        product_name: productName.trim(),
        quantity: quantity === "" ? 0 : Number(quantity),
      }),
    onSuccess: () => {
      setProductName("");
      setQuantity("");
      setFeedback("Ürün depoya eklendi.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: () => setFeedback("Eklenemedi — tekrar deneyin."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      updateInventoryItem(id, payload),
    onSuccess: () => {
      setEditingId(null);
      setEditQty("");
      setFeedback("Miktar güncellendi.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => setFeedback("Güncellenemedi."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      setFeedback("Ürün silindi.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => setFeedback("Silinemedi."),
  });

  const items = inventoryQuery.data ?? [];
  const lowStock = lowStockQuery.data ?? [];

  return (
    <div>
      <div className="card p-4">
        <h3 className="text-sm font-semibold">Depoya ürün ekle</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">Örn: Kahve çekirdeği, bardak, şurup…</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[10rem] flex-1">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Ürün adı</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ürün adı yazın"
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

      {inventoryQuery.isLoading ? <p className="mt-6 text-sm text-[var(--muted-foreground)]">Yükleniyor…</p> : null}
      {inventoryQuery.isError ? <p className="mt-6 alert alert-error">Depo listesi alınamadı.</p> : null}

      <ul className="mt-6 space-y-2">
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
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Depoda henüz ürün yok — yukarıdan ekleyin.</p>
      ) : null}

      {lowStock.length > 0 ? (
        <div className="mt-6 help-box">
          <p className="font-semibold text-[var(--foreground)]">⚠️ Azalan stok</p>
          <ul className="mt-2 space-y-1 text-sm">
            {lowStock.map((it: InventoryItem) => (
              <li key={it.id}>
                {it.product_name ?? `#${it.id}`} — {it.quantity ?? 0} adet kaldı
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 alert">{feedback}</p> : null}
    </div>
  );
}
