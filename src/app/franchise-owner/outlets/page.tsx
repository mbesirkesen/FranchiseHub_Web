"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createOutlet, deleteOutlet, getOutlets, updateOutlet } from "@/lib/api";
import { Outlet } from "@/lib/types";

export default function FranchiseOutletsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const outletsQuery = useQuery({
    queryKey: ["outlets"],
    queryFn: () => getOutlets(),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () => createOutlet({ name: name.trim(), city: city.trim() || null, address: address.trim() || null }),
    onSuccess: () => {
      setName("");
      setCity("");
      setAddress("");
      setFeedback("Şube eklendi.");
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
    },
    onError: () => setFeedback("Eklenemedi."),
  });

  const toggleMutation = useMutation({
    mutationFn: (outlet: Outlet) => updateOutlet(outlet.id, { is_active: !outlet.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outlets"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOutlet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outlets"] }),
  });

  const outlets = outletsQuery.data ?? [];

  return (
    <div>
      <h2 className="page-title">Şubeler</h2>
      <p className="page-desc">Çoklu lokasyon yönetimi (Saniiro / Gofrugal tarzı).</p>

      <div className="mt-6 grid gap-3 card-muted p-4 sm:grid-cols-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Şube adı" className={inputCls} />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Şehir" className={inputCls} />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres" className={inputCls} />
        <button
          type="button"
          disabled={createMutation.isPending || !name.trim()}
          onClick={() => createMutation.mutate()}
          className="rounded-xl btn btn-primary btn-sm disabled:opacity-50 sm:col-span-3 sm:max-w-xs"
        >
          Şube ekle
        </button>
      </div>

      {outletsQuery.isError ? (
        <p className="mt-4 text-[var(--danger)]">Şubeler yüklenemedi.</p>
      ) : null}

      <ul className="mt-6 space-y-2">
        {outlets.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--border)] border bg-[var(--bg-subtle)] px-3 py-2">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{o.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {o.city ?? "—"} · {o.address ?? "—"} · {o.is_active === false ? "Pasif" : "Aktif"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleMutation.mutate(o)} className="text-xs text-[var(--primary-hover)]">
                {o.is_active === false ? "Aktifleştir" : "Pasifleştir"}
              </button>
              <button type="button" onClick={() => deleteMutation.mutate(o.id)} className="text-xs text-red-300">
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!outletsQuery.isLoading && outlets.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Henüz şube yok.</p>
      ) : null}
      {feedback ? <p className="mt-4 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
    </div>
  );
}

const inputCls =
  "input";
