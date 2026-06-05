"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createBuyerSupplyRequest,
  getBuyerApplications,
  getBuyerBrandCenterInventory,
  getBuyerBrandOutlets,
  getBuyerSupplyRequests,
  getConversations,
} from "@/lib/api";
import { SUPPLY_STATUS_LABEL } from "@/lib/routes";
import { FriendlyHeader, HelpBox } from "@/components/ui/simple-blocks";

export default function BuyerSupplyPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [brandId, setBrandId] = useState("");
  const [outletId, setOutletId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");

  const appsQuery = useQuery({ queryKey: ["buyer-applications"], queryFn: () => getBuyerApplications() });
  const convsQuery = useQuery({ queryKey: ["conversations"], queryFn: () => getConversations() });
  const requestsQuery = useQuery({ queryKey: ["buyer-supply-requests"], queryFn: () => getBuyerSupplyRequests() });

  const approvedBrands = useMemo(() => {
    const apps = appsQuery.data ?? [];
    const convs = convsQuery.data ?? [];
    const map = new Map<number, string>();
    for (const app of apps) {
      if (app.status !== "approved" || app.brand_id == null) {
        continue;
      }
      const conv = convs.find((c) => c.application_id === app.id);
      const label = conv?.brand_name ?? `Marka #${app.brand_id}`;
      map.set(app.brand_id, label);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [appsQuery.data, convsQuery.data]);

  const outletsQuery = useQuery({
    queryKey: ["buyer-brand-outlets", brandId],
    queryFn: () => getBuyerBrandOutlets(Number(brandId)),
    enabled: brandId !== "",
  });

  const centerInventoryQuery = useQuery({
    queryKey: ["buyer-brand-center-inventory", brandId],
    queryFn: () => getBuyerBrandCenterInventory(Number(brandId)),
    enabled: brandId !== "",
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBuyerSupplyRequest({
        brand_id: Number(brandId),
        outlet_id: Number(outletId),
        product_name: productName.trim(),
        quantity: Number(quantity),
      }),
    onSuccess: () => {
      setProductName("");
      setQuantity("");
      setFeedback("Talebiniz marka merkezine iletildi.");
      queryClient.invalidateQueries({ queryKey: ["buyer-supply-requests"] });
    },
    onError: () => setFeedback("Talep gönderilemedi — marka, şube ve merkez stok listesinden ürün seçin."),
  });

  const outlets = outletsQuery.data ?? [];
  const centerProducts = centerInventoryQuery.data ?? [];
  const requests = requestsQuery.data ?? [];

  const selectedProduct = centerProducts.find((p) => p.product_name === productName);

  const submit = () => {
    if (!brandId || !outletId || !productName.trim() || !quantity) {
      setFeedback("Marka, şube, ürün ve adet zorunlu.");
      return;
    }
    createMutation.mutate();
  };

  if (approvedBrands.length === 0 && !appsQuery.isLoading) {
    return (
      <div>
        <FriendlyHeader title="Malzeme talebi" subtitle="Onaylı bayiliğiniz olunca merkeze talep gönderebilirsiniz." />
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Henüz onaylı bayiliğiniz yok. Önce marka başvurunuzun onaylanması gerekir.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FriendlyHeader title="Malzeme talebi" subtitle="Şubeniz için marka merkezine malzeme isteyin." />
      <HelpBox>
        Ürünü merkez deposundaki listeden seçin — elle yazılan adlar stokla eşleşmeyebilir. Onay ve sevkiyat marka
        sahibi tarafından yönetilir.
      </HelpBox>

      <div className="mt-4 card p-4">
        <h3 className="text-sm font-semibold">Yeni talep</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Marka</label>
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setOutletId("");
                setProductName("");
              }}
              className="mt-1 block w-full input"
            >
              <option value="">Seçin</option>
              {approvedBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Şube</label>
            <select
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              disabled={!brandId || outletsQuery.isLoading}
              className="mt-1 block w-full input"
            >
              <option value="">Seçin</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} · {o.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Ürün (merkez stok listesi)</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={!brandId || centerInventoryQuery.isLoading}
              className="mt-1 block w-full input"
            >
              <option value="">
                {centerInventoryQuery.isLoading ? "Stok listesi yükleniyor…" : "Seçin"}
              </option>
              {centerProducts.map((p) => (
                <option key={p.id} value={p.product_name ?? ""}>
                  {p.product_name} · merkezde {p.quantity ?? 0} adet
                </option>
              ))}
            </select>
            {brandId && !centerInventoryQuery.isLoading && centerProducts.length === 0 ? (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Merkez deposunda ürün yok — marka sahibi önce stok tanımlamalı.
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Adet</label>
            <input
              type="number"
              min={1}
              max={selectedProduct?.quantity ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full input"
            />
            {selectedProduct?.quantity != null ? (
              <p className="mt-1 text-xs text-[var(--muted)]">Merkezde en fazla {selectedProduct.quantity} adet talep edilebilir.</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          disabled={createMutation.isPending || !productName || centerProducts.length === 0}
          onClick={submit}
          className="btn btn-primary btn-sm mt-4 disabled:opacity-50"
        >
          Talebi gönder
        </button>
      </div>

      <div className="mt-6 card p-4">
        <h3 className="text-sm font-semibold">Taleplerim</h3>
        <ul className="mt-3 space-y-2">
          {requests.map((r) => (
            <li key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm">
              <p className="font-medium">
                {r.product_name} · {r.quantity} adet · {SUPPLY_STATUS_LABEL[r.status ?? "pending"]}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {r.outlet_name ? `${r.outlet_name} · ` : ""}Talep #{r.id}
              </p>
            </li>
          ))}
        </ul>
        {!requestsQuery.isLoading && requests.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Henüz talep yok.</p>
        ) : null}
      </div>

      {feedback ? <p className="mt-4 alert">{feedback}</p> : null}
    </div>
  );
}
