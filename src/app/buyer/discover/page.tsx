"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CompareTable } from "@/components/compare-table";
import { BrandCardShell, BrandDetailHero } from "@/components/buyer/brand-detail-hero";
import { BudgetSlider } from "@/components/buyer/budget-slider";
import { Skeleton } from "@/components/interaction/skeleton";
import { SuccessFeedback } from "@/components/interaction/success-feedback";
import { StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import { FriendlyHeader, HelpBox } from "@/components/ui/simple-blocks";
import {
  addBuyerFavorite,
  compareBrands,
  createApplication,
  getBrandById,
  getBrandFdds,
  getBrandMedia,
  getBrandTerritories,
  getBrands,
  removeBuyerFavorite,
} from "@/lib/api";
import { brandMatchesBudget } from "@/lib/brand-budget";

export default function BuyerDiscoverPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const brandFromUrl = Number(searchParams.get("brand"));
  const [budget, setBudget] = useState(1_500_000);
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [applicationNotes, setApplicationNotes] = useState("");
  const [compareIdsText, setCompareIdsText] = useState("");
  const [compareResult, setCompareResult] = useState<Array<Record<string, string | number | null>>>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 4500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  useEffect(() => {
    if (Number.isFinite(brandFromUrl) && brandFromUrl > 0) {
      setSelectedBrandId(brandFromUrl);
    }
  }, [brandFromUrl]);

  const filterParams = useMemo(
    () => ({
      sector: sector.trim() || undefined,
      location: location.trim() || undefined,
      q: searchQ.trim() || undefined,
    }),
    [sector, location, searchQ],
  );

  const brandsQuery = useQuery({
    queryKey: ["brands", filterParams],
    queryFn: () => getBrands(filterParams),
  });

  const allBrands = brandsQuery.data ?? [];
  const matchedBrands = useMemo(
    () => allBrands.filter((b) => brandMatchesBudget(b, budget)),
    [allBrands, budget],
  );

  const selectedBrandQuery = useQuery({
    queryKey: ["brand-detail", selectedBrandId],
    queryFn: () => getBrandById(selectedBrandId as number),
    enabled: selectedBrandId !== null,
  });

  const mediaQuery = useQuery({
    queryKey: ["brand-media", selectedBrandId],
    queryFn: () => getBrandMedia(selectedBrandId as number),
    enabled: selectedBrandId !== null,
    retry: false,
  });

  const fddQuery = useQuery({
    queryKey: ["brand-fdd", selectedBrandId],
    queryFn: () => getBrandFdds(selectedBrandId as number),
    enabled: selectedBrandId !== null,
    retry: false,
  });

  const territoryQuery = useQuery({
    queryKey: ["brand-territories", selectedBrandId],
    queryFn: () => getBrandTerritories(selectedBrandId as number),
    enabled: selectedBrandId !== null,
    retry: false,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ brandId, add }: { brandId: number; add: boolean }) => {
      if (add) await addBuyerFavorite(brandId);
      else await removeBuyerFavorite(brandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-favorites"] });
      setFeedback("Favori listesi güncellendi.");
    },
    onError: () => setFeedback("Favori işlemi başarısız."),
  });

  const compareMutation = useMutation({
    mutationFn: compareBrands,
    onSuccess: (rows) => {
      setCompareResult(rows);
      setFeedback("Karşılaştırma tamamlandı.");
    },
    onError: () => setFeedback("Karşılaştırma başarısız."),
  });

  const applyMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      setApplicationNotes("");
      setSuccessMessage("Marka sahibi başvurunuzu inceleyecek.");
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["buyer-applications"] });
    },
    onError: () => setFeedback("Başvuru oluşturulamadı."),
  });

  const compareIds = useMemo(
    () =>
      compareIdsText
        .split(",")
        .map((p) => Number(p.trim()))
        .filter((v) => Number.isFinite(v) && v > 0),
    [compareIdsText],
  );

  return (
    <div>
      <FriendlyHeader
        title="Fırsat keşfi"
        subtitle="Maksimum yatırım bütçenize göre karşılayabileceğiniz markalar listelenir."
      />

      <BudgetSlider budget={budget} matchCount={matchedBrands.length} onChange={setBudget} />

      <div className="mt-6 grid gap-3 card-muted p-4 sm:grid-cols-3">
        <FilterInput label="Marka adı" value={searchQ} onChange={setSearchQ} placeholder="Ara…" />
        <FilterInput label="Sektör" value={sector} onChange={setSector} placeholder="Örn: Gıda" />
        <FilterInput label="Şehir" value={location} onChange={setLocation} />
      </div>

      {brandsQuery.isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy aria-label="Markalar yükleniyor">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-4 h-8 w-full" />
            </div>
          ))}
        </div>
      ) : null}
      {brandsQuery.isError ? <p className="mt-6 alert alert-error">Liste alınamadı.</p> : null}

      <LayoutGroup id="brand-discover">
        <StaggerReveal className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matchedBrands.map((brand) => (
            <StaggerItem key={brand.id}>
              {selectedBrandId !== brand.id ? (
                <BrandCardShell
                  brand={brand}
                  layoutId={`brand-card-${brand.id}`}
                  selected={false}
                  onSelect={() => setSelectedBrandId(brand.id)}
                  onFavorite={() => favoriteMutation.mutate({ brandId: brand.id, add: true })}
                />
              ) : (
                <div className="brand-opportunity-card brand-opportunity-card-selected opacity-40" aria-hidden />
              )}
            </StaggerItem>
          ))}
        </StaggerReveal>

        <AnimatePresence>
          {selectedBrandId && selectedBrandQuery.data ? (
            <>
              <motion.button
                type="button"
                className="brand-detail-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBrandId(null)}
                aria-label="Detayı kapat"
              />
              <BrandDetailHero
                brand={selectedBrandQuery.data}
                layoutId={`brand-card-${selectedBrandId}`}
                media={mediaQuery.data}
                fdds={fddQuery.data}
                territories={territoryQuery.data}
                applicationNotes={applicationNotes}
                onNotesChange={setApplicationNotes}
                onClose={() => setSelectedBrandId(null)}
                applying={applyMutation.isPending}
                onApply={() =>
                  applyMutation.mutate({
                    brand_id: selectedBrandId,
                    notes: applicationNotes || "Web üzerinden başvuru.",
                  })
                }
              />
            </>
          ) : null}
        </AnimatePresence>
      </LayoutGroup>

      {!brandsQuery.isLoading && matchedBrands.length === 0 ? (
        <div className="mt-8">
          <HelpBox>
            {allBrands.length > 0
              ? "Bütçeniz listedeki markaların minimum yatırım tutarının altında görünüyor. Kaydırıcıyı artırın veya sektör/şehir filtrelerini gevşetin."
              : "Bu filtrelerle marka bulunamadı. Arama veya filtreleri gevşetin."}
          </HelpBox>
        </div>
      ) : null}

      <div className="mt-8 card-muted p-4">
        <h3 className="text-sm font-semibold">Marka karşılaştırma</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={compareIdsText}
            onChange={(e) => setCompareIdsText(e.target.value)}
            placeholder="Marka id: 1,2,3"
            className="input max-w-xs"
          />
          <button
            type="button"
            disabled={compareMutation.isPending || compareIds.length < 2}
            onClick={() => compareMutation.mutate({ brand_ids: compareIds })}
            className="btn btn-secondary btn-sm"
          >
            Karşılaştır
          </button>
        </div>
        <CompareTable rows={compareResult} />
      </div>

      {feedback ? <p className="mt-4 alert">{feedback}</p> : null}

      <SuccessFeedback
        open={showSuccess}
        title="Başvuru gönderildi"
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
}
