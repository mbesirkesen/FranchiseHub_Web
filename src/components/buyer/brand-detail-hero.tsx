"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { MagneticButton } from "@/components/interaction/magnetic-button";
import { SparklineHover } from "@/components/charts/sparkline-hover";
import { formatTry } from "@/components/buyer/brand-opportunity-card";
import { Brand, BrandFdd, BrandMedia, Territory } from "@/lib/types";

type Props = {
  brand: Brand;
  layoutId: string;
  media?: BrandMedia[];
  fdds?: BrandFdd[];
  territories?: Territory[];
  applicationNotes: string;
  onNotesChange: (v: string) => void;
  onClose: () => void;
  onApply: () => void;
  applying?: boolean;
  footer?: ReactNode;
};

export function BrandDetailHero({
  brand,
  layoutId,
  media,
  fdds,
  territories,
  applicationNotes,
  onNotesChange,
  onClose,
  onApply,
  applying,
  footer,
}: Props) {
  return (
    <motion.div
      layoutId={layoutId}
      className="brand-detail-hero"
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
    >
      <div className="brand-detail-hero-inner">
        <button type="button" className="brand-detail-close" onClick={onClose} aria-label="Kapat">
          ×
        </button>

        <div className="brand-detail-hero-head">
          <motion.span layoutId={`${layoutId}-initial`} className="brand-opportunity-initial brand-detail-initial">
            {brand.name.charAt(0).toUpperCase()}
          </motion.span>
          <div>
            <motion.h3 layoutId={`${layoutId}-name`} className="brand-detail-title">
              {brand.name}
            </motion.h3>
            <p className="brand-opportunity-meta">
              {brand.sector ?? "Sektör —"} · {brand.location ?? "Türkiye"}
            </p>
            <p className="brand-opportunity-budget">
              {formatTry(brand.min_investment_cost)}
              {brand.max_investment_cost ? ` – ${formatTry(brand.max_investment_cost)}` : ""}
            </p>
            <div className="brand-detail-roi-row">
              <span className="text-sm text-[var(--muted)]">Tahmini ROI</span>
              <SparklineHover seed={brand.id} label="6 ay trend" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">{brand.description ?? "Açıklama yok."}</p>

        {media && media.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {media.map((m, i) => (
              <img
                key={i}
                src={m.url}
                alt={m.alt ?? ""}
                className="h-20 w-20 rounded-xl object-cover"
                data-cursor-view
              />
            ))}
          </div>
        ) : null}

        {fdds && fdds.length > 0 ? (
          <ul className="mt-3 text-xs text-[var(--primary-hover)]">
            {fdds.map((f) => (
              <li key={f.id}>
                FDD: {f.title ?? f.year ?? f.id}
                {f.file_url ? (
                  <a href={f.file_url} className="ml-2 underline" target="_blank" rel="noreferrer">
                    İndir
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {territories && territories.length > 0 ? (
          <ul className="mt-2 text-xs text-[var(--muted)]">
            {territories.map((t) => (
              <li key={t.id}>
                {t.name ?? t.city} — {t.is_available ? "Müsait" : "Dolu"}
              </li>
            ))}
          </ul>
        ) : null}

        <textarea
          value={applicationNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          placeholder="Başvuru notunuz (isteğe bağlı)"
          className="textarea mt-4"
        />
        <MagneticButton strength={0.2}>
          <button type="button" disabled={applying} onClick={onApply} className="btn btn-primary btn-sm mt-3">
            Başvur
          </button>
        </MagneticButton>
        {footer}
      </div>
    </motion.div>
  );
}

export function BrandCardShell({
  brand,
  layoutId,
  selected,
  onSelect,
  onFavorite,
}: {
  brand: Brand;
  layoutId: string;
  selected?: boolean;
  onSelect: () => void;
  onFavorite: () => void;
}) {
  return (
    <motion.div
      layoutId={selected ? undefined : layoutId}
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
        <motion.span layoutId={selected ? undefined : `${layoutId}-initial`} className="brand-opportunity-initial">
          {brand.name.charAt(0).toUpperCase()}
        </motion.span>
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
      <motion.h3 layoutId={selected ? undefined : `${layoutId}-name`} className="brand-opportunity-name">
        {brand.name}
      </motion.h3>
      <p className="brand-opportunity-meta">
        {brand.sector ?? "Sektör —"} · {brand.location ?? "Türkiye"}
      </p>
      <p className="brand-opportunity-budget">
        {formatTry(brand.min_investment_cost)}
        {brand.max_investment_cost ? ` – ${formatTry(brand.max_investment_cost)}` : ""}
      </p>
      <motion.div className="brand-opportunity-roi">
        <span>Tahmini ROI</span>
        <SparklineHover seed={brand.id} />
      </motion.div>
    </motion.div>
  );
}
