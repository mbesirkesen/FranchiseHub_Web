"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { SparklineHover } from "@/components/charts/sparkline-hover";
import { formatTry } from "@/components/buyer/brand-opportunity-card";
import { getBrandFddDownloadUrl } from "@/lib/api";
import { Brand, BrandFdd, BrandMedia, Territory } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Genel Bakış" },
  { id: "financial", label: "Finansal" },
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

function budgetLabel(brand: Brand): string {
  const min = formatTry(brand.min_investment_cost);
  const max = formatTry(brand.max_investment_cost);
  if (min && max && min !== max) return `${min} – ${max}`;
  return min || max || "—";
}

function formatFddTitle(f: BrandFdd): string {
  const title = f.title?.trim();
  if (title && title.toLowerCase() !== "fdd") {
    return f.version ? `${title} · ${f.version}` : title;
  }
  const base = "Franchise Bilgi Formu";
  if (f.version) return `${base} · ${f.version}`;
  const published = f.published_at ? new Date(f.published_at) : null;
  if (published && !Number.isNaN(published.getTime())) {
    return `${base} · ${published.getFullYear()}`;
  }
  if (f.year) return `${base} · ${f.year}`;
  return base;
}

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
  const [downloadingFddId, setDownloadingFddId] = useState<number | null>(null);
  const [fddError, setFddError] = useState<string | null>(null);
  const openTerritories = territories?.filter((t) => t.is_available).length ?? 0;
  const totalTerritories = territories?.length ?? 0;

  async function handleFddDownload(fddId: number) {
    setFddError(null);
    setDownloadingFddId(fddId);
    try {
      const url = await getBrandFddDownloadUrl(brand.id, fddId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setFddError("Doküman indirilemedi. Lütfen tekrar deneyin.");
    } finally {
      setDownloadingFddId(null);
    }
  }

  return (
    <motion.div
      layoutId={layoutId}
      className="brand-detail-hero"
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
    >
      <div className="brand-detail-hero-inner">
        <header className="brand-detail-header">
          <div className="brand-detail-header-main">
            <motion.span layoutId={`${layoutId}-initial`} className="brand-opportunity-initial brand-detail-initial">
              {brand.name.charAt(0).toUpperCase()}
            </motion.span>
            <div className="brand-detail-header-text">
              <motion.h3 layoutId={`${layoutId}-name`} className="brand-detail-title">
                {brand.name}
              </motion.h3>
              <p className="brand-detail-subtitle">
                {[brand.sector, brand.location].filter(Boolean).join(" · ") || "Franchise fırsatı"}
              </p>
            </div>
          </div>
          <button type="button" className="brand-detail-close" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </header>

        <dl className="brand-detail-stats">
          <div className="brand-detail-stat">
            <dt>Yatırım</dt>
            <dd>{budgetLabel(brand)}</dd>
          </div>
          <div className="brand-detail-stat">
            <dt>ROI trendi</dt>
            <dd className="brand-detail-stat-roi">
              <SparklineHover seed={brand.id} label="6 ay" />
            </dd>
          </div>
          <div className="brand-detail-stat">
            <dt>Bölge</dt>
            <dd>
              {totalTerritories > 0 ? `${openTerritories} müsait / ${totalTerritories}` : "Bilgi yok"}
            </dd>
          </div>
        </dl>

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
            <div className="brand-detail-section">
              <p className="brand-detail-body">{brand.description ?? "Bu marka için henüz açıklama eklenmemiş."}</p>
              {brand.support_details ? (
                <div className="brand-detail-callout">
                  <p className="brand-detail-callout-label">Destek</p>
                  <p className="brand-detail-body">{brand.support_details}</p>
                </div>
              ) : null}
              {media && media.length > 0 ? (
                <div className="brand-detail-media-grid">
                  {media.map((m, i) => (
                    <img
                      key={m.id ?? i}
                      src={m.url}
                      alt={m.alt ?? brand.name}
                      className="brand-detail-media-thumb"
                      data-cursor-view
                    />
                  ))}
                </div>
              ) : (
                <p className="brand-detail-muted">Henüz görsel eklenmemiş.</p>
              )}
            </div>
          ) : null}

          {tab === "financial" ? (
            <div className="brand-detail-section">
              <div className="brand-detail-metric-cards">
                <div className="brand-detail-metric-card">
                  <span className="brand-detail-metric-label">Minimum yatırım</span>
                  <strong>{formatTry(brand.min_investment_cost) || "—"}</strong>
                </div>
                <div className="brand-detail-metric-card">
                  <span className="brand-detail-metric-label">Maksimum yatırım</span>
                  <strong>{formatTry(brand.max_investment_cost) || formatTry(brand.initial_cost) || "—"}</strong>
                </div>
              </div>
              {fdds && fdds.length > 0 ? (
                <ul className="brand-detail-doc-list">
                  {fdds.map((f) => (
                    <li key={f.id} className="brand-detail-fdd-item">
                      <span>{formatFddTitle(f)}</span>
                      <button
                        type="button"
                        className="brand-detail-link"
                        disabled={downloadingFddId === f.id}
                        onClick={() => handleFddDownload(f.id)}
                      >
                        {downloadingFddId === f.id ? "Hazırlanıyor…" : "İndir"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="brand-detail-muted">Franchise bilgi formu henüz paylaşılmamış.</p>
              )}
              {fddError ? <p className="brand-detail-muted brand-detail-error">{fddError}</p> : null}
            </div>
          ) : null}

          {tab === "location" ? (
            <div className="brand-detail-section">
              {territories && territories.length > 0 ? (
                <ul className="brand-detail-territory-list">
                  {territories.map((t) => (
                    <li key={t.id} className="brand-detail-territory-item">
                      <span>{t.name ?? t.city ?? "Bölge"}</span>
                      <span className={t.is_available ? "brand-detail-territory-open" : "brand-detail-territory-full"}>
                        {t.is_available ? "Müsait" : "Dolu"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="brand-detail-body">
                  Bölge listesi henüz yok. Başvurunuz sonrası marka ekibi uygun lokasyonları sizinle paylaşır.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <footer className="brand-detail-footer">
          <textarea
            value={applicationNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="Başvuru notu (isteğe bağlı)"
            className="textarea brand-detail-notes"
          />
          <button
            type="button"
            disabled={applying}
            onClick={onApply}
            className="btn btn-primary brand-detail-apply-btn"
          >
            {applying ? "Gönderiliyor…" : "Hemen Başvur"}
          </button>
          {footer}
        </footer>
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
