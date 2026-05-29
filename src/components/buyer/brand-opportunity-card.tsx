"use client";

import { motion } from "framer-motion";
import { Brand } from "@/lib/types";

export function estimateRoi(brand: Brand): number {
  const seed = brand.id * 13 + (brand.min_investment_cost ?? 0) / 100000;
  return Math.round(14 + (seed % 17));
}

export function formatTry(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

type Props = {
  brand: Brand;
  selected?: boolean;
  onSelect: () => void;
  onFavorite: () => void;
};

export function BrandOpportunityCard({ brand, selected, onSelect, onFavorite }: Props) {
  const roi = estimateRoi(brand);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      onClick={onSelect}
      className={`brand-opportunity-card ${selected ? "brand-opportunity-card-selected" : ""}`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="brand-opportunity-top">
        <span className="brand-opportunity-initial">{brand.name.charAt(0).toUpperCase()}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className="brand-opportunity-star"
          aria-label="Favoriye ekle"
        >
          ★
        </button>
      </div>
      <h3 className="brand-opportunity-name">{brand.name}</h3>
      <p className="brand-opportunity-meta">
        {brand.sector ?? "Sektör —"} · {brand.location ?? "Türkiye"}
      </p>
      <p className="brand-opportunity-budget">
        {formatTry(brand.min_investment_cost)}
        {brand.max_investment_cost ? ` – ${formatTry(brand.max_investment_cost)}` : ""}
      </p>
      <motion.div className="brand-opportunity-roi">
        <span>Tahmini ROI</span>
        <strong>%{roi}</strong>
      </motion.div>
    </motion.div>
  );
}
