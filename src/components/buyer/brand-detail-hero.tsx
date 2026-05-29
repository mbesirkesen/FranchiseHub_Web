"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { MagneticButton } from "@/components/interaction/magnetic-button";
import { SparklineHover } from "@/components/charts/sparkline-hover";
import { formatTry } from "@/components/buyer/brand-opportunity-card";
import { Brand, BrandFdd, BrandMedia, Territory } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Genel Bakış" },
  { id: "financial", label: "Finansal Detaylar" },
  { id: "location", label: "Lokasyon" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [tab, setTab] = useState<TabId>("overview");

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

        <div className="brand-detail-layout">
          <div className="brand-detail-main">
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
              </div>
            </div>

            <nav className="brand-detail-tabs" aria-label="Marka detay sekmeleri">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`brand-detail-tab${tab === t.id ? " brand-detail-tab-active" : ""}`}
                  onClick={() => setTab(t.id)}
                  aria-selected={tab === t.id}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="brand-detail-tab-panel">
              {tab === "overview" ? (
                <>
                  <p className="text-sm text-[var(--muted-foreground)]">{brand.description ?? "Açıklama yok."}</p>
                  {media && media.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {media.map((m, i) => (
                        <img
                          key={i}
                          src={m.url}
                          alt={m.alt ?? ""}
                          className="h-24 w-24 rounded-xl object-cover"
                          data-cursor-view
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-[var(--muted)]">Henüz görsel eklenmemiş.</p>
                  )}
                </>
              ) : null}

              {tab === "financial" ? (
                <>
                  <p className="brand-opportunity-budget brand-detail-sidebar-budget">
                    {formatTry(brand.min_investment_cost)}
                    {brand.max_investment_cost ? ` – ${formatTry(brand.max_investment_cost)}` : ""}
                  </p>
                  <div className="brand-detail-roi-row">
                    <span className="text-sm text-[var(--muted)]">Tahmini ROI</span>
                    <SparklineHover seed={brand.id} label="6 ay trend" />
                  </div>
                  {fdds && fdds.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm">
                      {fdds.map((f) => (
                        <li key={f.id} className="brand-detail-fdd-item">
                          <span>FDD: {f.title ?? f.year ?? f.id}</span>
                          {f.file_url ? (
                            <a href={f.file_url} className="text-[var(--primary)] underline" target="_blank" rel="noreferrer">
                              İndir
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-[var(--muted)]">FDD dokümanı henüz paylaşılmamış.</p>
                  )}
                </>
              ) : null}

              {tab === "location" ? (
                territories && territories.length > 0 ? (
                  <ul className="brand-detail-territory-list">
                    {territories.map((t) => (
                      <li key={t.id} className="brand-detail-territory-item">
                        <span>{t.name ?? t.city}</span>
                        <span className={t.is_available ? "brand-detail-territory-open" : "brand-detail-territory-full"}>
                          {t.is_available ? "Müsait" : "Dolu"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Bu marka için bölge bilgisi henüz listelenmemiş. Başvurunuz sonrası marka ekibi sizinle paylaşır.
                  </p>
                )
              ) : null}
            </div>

            <textarea
              value={applicationNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={2}
              placeholder="Başvuru notunuz (isteğe bağlı)"
              className="textarea mt-4 brand-detail-notes"
            />
            {footer}
          </div>

          <aside className="brand-detail-sidebar">
            <div className="brand-detail-sidebar-sticky">
              <p className="brand-detail-sidebar-label">Özet Bilgiler</p>
              <p className="brand-opportunity-meta">{brand.sector ?? "Sektör —"}</p>
              <p className="brand-opportunity-budget brand-detail-sidebar-budget">
                {formatTry(brand.min_investment_cost)}
                {brand.max_investment_cost ? ` – ${formatTry(brand.max_investment_cost)}` : ""}
              </p>
              <div className="brand-detail-roi-row">
                <span className="text-xs text-[var(--muted)]">ROI trendi</span>
                <SparklineHover seed={brand.id} label="6 ay" />
              </div>
              {territories && territories.length > 0 ? (
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {territories.filter((t) => t.is_available).length} müsait bölge
                </p>
              ) : null}
              <MagneticButton strength={0.22}>
                <button
                  type="button"
                  disabled={applying}
                  onClick={onApply}
                  className="btn btn-primary w-full mt-4 btn-glow brand-detail-apply-btn"
                >
                  {applying ? "Gönderiliyor…" : "Hemen Başvur"}
                </button>
              </MagneticButton>
            </div>
          </aside>
        </div>
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
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
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
      <span className="brand-opportunity-cta">Detayları İncele</span>
    </motion.div>
  );
}
