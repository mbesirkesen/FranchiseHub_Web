"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/role-guard";
import { compareBrands, createApplication, getBrandById, getBrands } from "@/lib/api";
import { BUYER_NAV } from "@/lib/routes";
import { Brand } from "@/lib/types";

export default function BuyerPage() {
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [applicationNotes, setApplicationNotes] = useState("");
  const [compareIdsText, setCompareIdsText] = useState("1,2");
  const [feedback, setFeedback] = useState<string | null>(null);

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () => getBrands(),
  });

  const selectedBrandQuery = useQuery({
    queryKey: ["brand-detail", selectedBrandId],
    queryFn: () => getBrandById(selectedBrandId as number),
    enabled: selectedBrandId !== null,
  });

  const compareMutation = useMutation({
    mutationFn: compareBrands,
    onSuccess: () => {
      setFeedback("Marka karsilastirma istegi basarili.");
    },
    onError: () => {
      setFeedback("Karsilastirma istegi basarisiz.");
    },
  });

  const applyMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      setApplicationNotes("");
      setFeedback("Basvuru basariyla olusturuldu.");
    },
    onError: () => {
      setFeedback("Basvuru olusturulamadi.");
    },
  });

  const compareIds = useMemo(
    () =>
      compareIdsText
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((value) => Number.isFinite(value) && value > 0),
    [compareIdsText],
  );

  const onCompare = () => {
    if (compareIds.length < 2) {
      setFeedback("Karsilastirma icin en az iki marka id girin.");
      return;
    }
    compareMutation.mutate({ brand_ids: compareIds });
  };

  const onApply = () => {
    if (!selectedBrandId) {
      setFeedback("Basvuru icin once marka secin.");
      return;
    }
    applyMutation.mutate({
      brand_id: selectedBrandId,
      notes: applicationNotes || "Frontend uzerinden basvuru olusturuldu.",
    });
  };

  const brands = brandsQuery.data ?? [];

  return (
    <RoleGuard role="buyer">
      <AppShell title="Alıcı paneli" sideNav={BUYER_NAV} asideTitle="Menü">
        <h2 className="text-lg font-semibold text-slate-50">Marka Kesfi ve Basvuru Akisi</h2>
        <p className="mt-2 text-sm text-slate-400">
          Bu ekran brands listeleme, brand detay, marka karsilastirma ve basvuru endpointleri ile
          calisir.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-100">Onayli Markalar</h3>
            {brandsQuery.isLoading ? (
              <p className="mt-3 text-sm text-slate-400">Markalar yukleniyor...</p>
            ) : null}
            {brandsQuery.isError ? (
              <p className="mt-3 text-sm text-red-400">Marka listesi alinamadi.</p>
            ) : null}
            <ul className="mt-3 space-y-2">
              {brands.map((brand: Brand) => (
                <li
                  key={brand.id}
                  className="flex items-center justify-between rounded-lg border border-slate-500/25 bg-slate-950/30 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">{brand.name}</p>
                    <p className="text-xs text-slate-500">
                      {brand.sector ?? "sektor yok"} - {brand.location ?? "lokasyon yok"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBrandId(brand.id)}
                    className="rounded-lg border border-slate-500/35 px-2 py-1 text-xs text-slate-200 hover:border-cyan-400/40"
                  >
                    Detay
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-100">Secili Marka Detayi</h3>
            {!selectedBrandId ? (
              <p className="mt-3 text-sm text-slate-400">Listeden bir marka secin.</p>
            ) : null}
            {selectedBrandQuery.isLoading ? (
              <p className="mt-3 text-sm text-slate-400">Detay yukleniyor...</p>
            ) : null}
            {selectedBrandQuery.data ? (
              <div className="mt-3 rounded-lg border border-slate-500/25 bg-slate-950/40 p-3 text-sm text-slate-200">
                <p>
                  <span className="font-semibold text-slate-100">Ad:</span> {selectedBrandQuery.data.name}
                </p>
                <p>
                  <span className="font-semibold text-slate-100">Sektor:</span>{" "}
                  {selectedBrandQuery.data.sector ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-100">Lokasyon:</span>{" "}
                  {selectedBrandQuery.data.location ?? "-"}
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-300">Basvuru notu</label>
              <textarea
                value={applicationNotes}
                onChange={(event) => setApplicationNotes(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
                rows={3}
                placeholder="Ankara icin franchise dusunuyorum."
              />
              <button
                type="button"
                onClick={onApply}
                disabled={applyMutation.isPending}
                className="mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
              >
                {applyMutation.isPending ? "Basvuru gonderiliyor..." : "Basvuru Olustur"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-100">Marka Karsilastirma</h3>
          <p className="mt-1 text-xs text-slate-400">Ornek: `1,2` ya da `3,8,12`</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={compareIdsText}
              onChange={(event) => setCompareIdsText(event.target.value)}
              className="w-48 rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            />
            <button
              type="button"
              onClick={onCompare}
              disabled={compareMutation.isPending}
              className="rounded-xl border border-slate-500/35 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 hover:border-cyan-400/40 disabled:opacity-60"
            >
              {compareMutation.isPending ? "Karsilastiriliyor..." : "Karsilastir"}
            </button>
          </div>
        </div>

        {feedback ? (
          <p className="mt-4 rounded-xl border border-slate-500/30 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
            {feedback}
          </p>
        ) : null}
      </AppShell>
    </RoleGuard>
  );
}
