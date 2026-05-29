"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createFranchiseBrand, getFranchiseMyBrand, updateFranchiseBrand } from "@/lib/api";
import { getUserFacingError } from "@/lib/form-errors";
import { Brand } from "@/lib/types";

function brandPayload(
  name: string,
  sector: string,
  location: string,
  minCost: string,
  maxCost: string,
  initialCost: string,
  description: string,
  supportDetails: string,
) {
  return {
    name: name.trim(),
    sector: sector.trim() || null,
    location: location.trim() || null,
    min_investment_cost: minCost === "" ? null : Number(minCost),
    max_investment_cost: maxCost === "" ? null : Number(maxCost),
    initial_cost: initialCost === "" ? null : Number(initialCost),
    description: description.trim() || null,
    support_details: supportDetails.trim() || null,
  };
}

export default function FranchiseBrandProfilePage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [minCost, setMinCost] = useState("");
  const [maxCost, setMaxCost] = useState("");
  const [initialCost, setInitialCost] = useState("");
  const [description, setDescription] = useState("");
  const [supportDetails, setSupportDetails] = useState("");

  const brandQuery = useQuery({
    queryKey: ["franchise-my-brand"],
    queryFn: () => getFranchiseMyBrand(),
    retry: false,
  });

  useEffect(() => {
    const b = brandQuery.data;
    if (!b) {
      setName("");
      setSector("");
      setLocation("");
      setMinCost("");
      setMaxCost("");
      setInitialCost("");
      setDescription("");
      setSupportDetails("");
      return;
    }
    setName(b.name ?? "");
    setSector(b.sector ?? "");
    setLocation(b.location ?? "");
    setMinCost(b.min_investment_cost != null ? String(b.min_investment_cost) : "");
    setMaxCost(b.max_investment_cost != null ? String(b.max_investment_cost) : "");
    setInitialCost(b.initial_cost != null ? String(b.initial_cost) : "");
    setDescription(b.description ?? "");
    setSupportDetails(b.support_details ?? "");
  }, [brandQuery.data]);

  const createMutation = useMutation({
    mutationFn: () => createFranchiseBrand(brandPayload(name, sector, location, minCost, maxCost, initialCost, description, supportDetails)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-my-brand"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateFranchiseBrand(brandPayload(name, sector, location, minCost, maxCost, initialCost, description, supportDetails)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-my-brand"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-dashboard-summary"] });
    },
  });

  const brand: Brand | null | undefined = brandQuery.data;
  const hasBrand = Boolean(brand);
  const saving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error ?? updateMutation.error;
  const saveSuccess = createMutation.isSuccess || updateMutation.isSuccess;

  const loadErrorMessage =
    brandQuery.error != null
      ? getUserFacingError(brandQuery.error, "Marka bilgisi yüklenemedi. Oturumunuzu kontrol edip tekrar deneyin.")
      : null;

  const saveErrorMessage =
    saveError != null
      ? getUserFacingError(saveError, "Kayıt sırasında bir sorun oluştu. Bilgilerinizi kontrol edip tekrar deneyin.")
      : null;

  return (
    <div>
      <h2 className="page-title">Marka profili</h2>
      <p className="page-desc">
        Marka bilgilerinizi güncelleyin; aday yatırımcılar keşif ve başvuru ekranlarında bu profili görür.
      </p>

      {brandQuery.isLoading ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Marka bilgisi yükleniyor…</p>
      ) : null}

      {brandQuery.isError ? (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-200">
          <p>{loadErrorMessage}</p>
        </div>
      ) : null}

      {!brandQuery.isLoading && !brandQuery.isError ? (
        <div className="mt-6 space-y-4 rounded-xl bg-[var(--border)] border bg-[var(--bg-subtle)] p-5 backdrop-blur-sm">
          {!hasBrand ? (
            <p className="rounded-lg border border-[var(--primary)]/25 bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
              Henüz bir marka profiliniz yok. Marka adını ve yatırım bilgilerinizi girerek ilk profilinizi
              oluşturabilirsiniz; başlangıç yatırım bedeli ve min/maks aralığı adayların sizi değerlendirmesine
              yardımcı olur.
            </p>
          ) : null}
          {hasBrand && brand?.is_approved === false ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
              Markanız inceleme aşamasında. Onaylandıktan sonra keşif listelerinde yayınlanır.
            </p>
          ) : null}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Marka adı</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full max-w-md input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Sektör</label>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 w-full max-w-md input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Lokasyon</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full max-w-md input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full max-w-2xl input"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Destek / ek bilgi</label>
            <textarea
              value={supportDetails}
              onChange={(e) => setSupportDetails(e.target.value)}
              rows={2}
              className="mt-1 w-full max-w-2xl input"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)]">
                Başlangıç yatırım bedeli (opsiyonel)
              </label>
              <input
                type="number"
                value={initialCost}
                onChange={(e) => setInitialCost(e.target.value)}
                placeholder="Örn. 250000"
                className="mt-1 w-40 input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Min. yatırım</label>
              <input
                type="number"
                value={minCost}
                onChange={(e) => setMinCost(e.target.value)}
                className="mt-1 w-36 input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Maks. yatırım</label>
              <input
                type="number"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                className="mt-1 w-36 input"
              />
            </div>
          </div>

          {saveErrorMessage ? <p className="text-[var(--danger)]">{saveErrorMessage}</p> : null}
          {saveSuccess ? (
            <p className="text-sm text-emerald-400">{hasBrand ? "Güncellendi." : "Marka oluşturuldu."}</p>
          ) : null}

          {hasBrand ? (
            <button
              type="button"
              disabled={saving || !name.trim()}
              onClick={() => updateMutation.mutate()}
              className="rounded-xl btn btn-primary disabled:opacity-50"
            >
              {updateMutation.isPending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || !name.trim()}
              onClick={() => createMutation.mutate()}
              className="rounded-xl btn btn-primary disabled:opacity-50"
            >
              {createMutation.isPending ? "Oluşturuluyor…" : "Marka oluştur"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
