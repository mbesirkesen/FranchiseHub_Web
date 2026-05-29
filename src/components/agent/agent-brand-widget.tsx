"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { estimateRoi, formatTry } from "@/components/buyer/brand-opportunity-card";
import { AssistantBrand } from "@/lib/types";

type Props = {
  brand: AssistantBrand;
  index: number;
};

export function AgentBrandWidget({ brand, index }: Props) {
  const roi =
    brand.estimated_roi_percent != null && Number.isFinite(brand.estimated_roi_percent)
      ? Math.round(brand.estimated_roi_percent)
      : estimateRoi(brand);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/buyer/discover?brand=${brand.id}`} className="agent-brand-widget">
        <span className="agent-brand-widget-initial">{brand.name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="agent-brand-widget-name">{brand.name}</p>
          <p className="agent-brand-widget-meta">
            {brand.sector ?? "—"} · {brand.location ?? "Türkiye"}
          </p>
          <p className="agent-brand-widget-budget">{formatTry(brand.min_investment_cost)}</p>
          {brand.match_reasons && brand.match_reasons.length > 0 ? (
            <p className="agent-brand-widget-match">{brand.match_reasons[0]}</p>
          ) : null}
        </div>
        <span className="agent-brand-widget-roi">%{roi}</span>
      </Link>
    </motion.div>
  );
}
