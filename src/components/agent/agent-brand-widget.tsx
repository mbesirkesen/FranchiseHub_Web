"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { estimateRoi, formatTry } from "@/components/buyer/brand-opportunity-card";
import { Brand } from "@/lib/types";

type Props = {
  brand: Brand;
  index: number;
};

export function AgentBrandWidget({ brand, index }: Props) {
  const roi = estimateRoi(brand);

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
        </div>
        <span className="agent-brand-widget-roi">%{roi}</span>
      </Link>
    </motion.div>
  );
}
