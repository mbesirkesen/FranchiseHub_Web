"use client";

import { motion } from "framer-motion";
import { useId, useMemo, useState } from "react";

export function generateGrowthSeries(seed: number, months = 6): number[] {
  return Array.from({ length: months }, (_, i) => {
    const base = 8 + ((seed * 13 + i * 29) % 14);
    return Math.round((base + i * 1.8) * 10) / 10;
  });
}

type Props = {
  seed: number;
  label?: string;
  className?: string;
};

export function SparklineHover({ seed, label = "Büyüme", className }: Props) {
  const [open, setOpen] = useState(false);
  const gradientId = useId();
  const data = useMemo(() => generateGrowthSeries(seed), [seed]);
  const latest = data[data.length - 1] ?? 0;
  const w = 120;
  const h = 44;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <span
      className={`sparkline-hover ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="img"
      aria-label={`Son 6 ay büyüme trendi yüzde ${latest}`}
    >
      <strong className="sparkline-hover-value">%{Math.round(latest)}</strong>
      <span className="sparkline-hover-caption">{label}</span>

      <motion.span
        className="sparkline-popover"
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 6, scale: open ? 1 : 0.96 }}
        transition={{ duration: 0.2 }}
        aria-hidden={!open}
      >
        <span className="sparkline-popover-title">Son 6 ay</span>
        <svg viewBox={`0 0 ${w} ${h}`} className="sparkline-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,107,74,0.35)" />
              <stop offset="100%" stopColor="rgba(255,107,74,0)" />
            </linearGradient>
          </defs>
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: open ? 1 : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          />
        </svg>
      </motion.span>
    </span>
  );
}
