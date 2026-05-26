"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  updateInventoryItem,
} from "@/lib/api";
import { InventoryItem } from "@/lib/types";

export default function FranchiseInventoryPage() {
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

  const createMutation = useMutation({
    mutationFn: () =>
      createInventoryItem({
        product_name: productName.trim(),
        quantity: quantity === "" ? 0 : Number(quantity),
      }),
    onSuccess: () => {
      setProductName("");
      setQuantity("");
      setFeedback("Kalem eklendi.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: () => setFeedback("Eklenemedi."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      updateInventoryItem(id, payload),
    onSuccess: () => {
      setEditingId(null);
      setEditQty("");
      setFeedback("Güncellendi.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: () => setFeedback("Güncellenemedi."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      setFeedback("Silindi.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
    onError: () => setFeedback("Silinemedi."),
  });

  const items = inventoryQuery.data ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-50">Envanter</h2>
      <p className="mt-2 text-sm text-slate-400">
        Ürün kalemlerinizi listeleyin; backend şemasına göre alanlar genişletilebilir.
      </p>

      <div className="mt-6 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-50">Yeni kalem</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300">Ürün adı</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 block w-48 rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">Miktar</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-28 rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            />
          </div>
          <button
            type="button"
            disabled={createMutation.isPending || !productName.trim()}
            onClick={() => createMutation.mutate()}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      </div>

      {inventoryQuery.isLoading ? (
        <p className="mt-6 text-sm text-slate-400">Yükleniyor…</p>
      ) : null}
      {inventoryQuery.isError ? (
        <p className="mt-6 text-sm text-red-400">Envanter alınamadı.</p>
      ) : null}

      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-500/25 bg-slate-950/30 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-slate-50">
                {item.product_name ?? `Ürün #${item.id}`}
              </p>
              <p className="text-xs text-slate-500">
                Miktar: {item.quantity ?? "—"} {item.unit ? `· ${item.unit}` : null}
                {item.sku ? ` · SKU: ${item.sku}` : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editingId === item.id ? (
                <>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-24 rounded-lg border border-slate-500/40 bg-slate-950/50 px-2 py-1 text-sm text-slate-100"
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
                    className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditQty("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    İptal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditQty(String(item.quantity ?? ""));
                  }}
                  className="rounded-lg border border-slate-500/35 px-2 py-1 text-xs text-slate-200 hover:border-cyan-400/40"
                >
                  Düzenle
                </button>
              )}
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(item.id)}
                className="rounded-lg border border-red-400/45 bg-red-950/35 px-2 py-1 text-xs text-red-200 hover:bg-red-950/55"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!inventoryQuery.isLoading && items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Kayıt yok.</p>
      ) : null}

      {feedback ? (
        <p className="mt-4 rounded-xl border border-slate-500/30 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
