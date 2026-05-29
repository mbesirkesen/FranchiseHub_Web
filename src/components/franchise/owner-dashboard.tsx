"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { BentoCell, BentoGrid } from "@/components/interaction/bento-grid";
import { Skeleton } from "@/components/interaction/skeleton";
import { EcosystemGraph } from "@/components/franchise/ecosystem-graph";
import { FranchiseDashboardSummary, Application } from "@/lib/types";

const TR_CITIES = [
  { name: "İstanbul", x: 28, y: 32 },
  { name: "Ankara", x: 48, y: 38 },
  { name: "İzmir", x: 18, y: 48 },
  { name: "Bursa", x: 26, y: 36 },
  { name: "Antalya", x: 42, y: 62 },
  { name: "Adana", x: 58, y: 58 },
  { name: "Trabzon", x: 72, y: 28 },
];

type Props = {
  summary: FranchiseDashboardSummary | undefined;
  applications: Application[];
  loading?: boolean;
};

export function FranchiseOwnerDashboard({ summary, applications, loading }: Props) {
  const s = summary;
  const chartData = useMemo(
    () => [
      { label: "Bekleyen", value: s?.pending_applications ?? 0, color: "#f59e0b" },
      { label: "Onaylı", value: s?.approved_applications ?? 0, color: "#22c55e" },
      { label: "Reddedilen", value: s?.rejected_applications ?? 0, color: "#ef4444" },
    ],
    [s],
  );
  const maxBar = Math.max(...chartData.map((d) => d.value), 1);

  const heatPoints = useMemo(() => {
    const total = applications.length || 1;
    return TR_CITIES.map((city, i) => {
      const slice = applications.filter((_, idx) => idx % TR_CITIES.length === i);
      const intensity = slice.length / total;
      const boost = (s?.pending_applications ?? 0) > 0 ? 0.25 + intensity * 0.75 : 0.15 + intensity * 0.5;
      return { ...city, intensity: Math.min(1, boost) };
    });
  }, [applications, s?.pending_applications]);

  const metrics = [
    { label: "Toplam başvuru", value: s?.total_applications ?? 0 },
    { label: "Bekleyen", value: s?.pending_applications ?? 0 },
    { label: "Onaylı", value: s?.approved_applications ?? 0 },
    { label: "Depo kalemi", value: s?.inventory_item_count ?? 0 },
  ];

  if (loading) {
    return (
      <BentoGrid className="mt-2">
        {metrics.map((m) => (
          <BentoCell key={m.label}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-3 h-8 w-1/3" />
          </BentoCell>
        ))}
        <BentoCell span="2" className="min-h-[14rem]">
          <Skeleton className="h-full w-full" />
        </BentoCell>
        <BentoCell className="min-h-[14rem]">
          <Skeleton className="h-full w-full" />
        </BentoCell>
      </BentoGrid>
    );
  }

  return (
    <BentoGrid className="mt-2">
      {metrics.map((m, i) => (
        <BentoCell key={m.label} className="bento-metric">
          <Reveal delay={i * 0.05}>
            <p className="bento-metric-label">{m.label}</p>
            <p className="bento-metric-value">
              <CountUp value={m.value} />
            </p>
          </Reveal>
        </BentoCell>
      ))}

      <BentoCell span="2" className="min-h-[14rem]">
        <Reveal delay={0.1}>
          <>
            <h3 className="dash-panel-title">Başvuru talebi</h3>
            <p className="dash-panel-desc">Son dönem dağılımı</p>
            <div className="mt-6 flex h-36 items-end justify-around gap-3">
              {chartData.map((bar, i) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    className="chart-bar w-full max-w-12 rounded-t-lg"
                    style={{ background: bar.color }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(bar.value / maxBar) * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="text-xs font-bold text-[var(--foreground)]">{bar.value}</span>
                  <span className="text-[10px] text-[var(--muted)]">{bar.label}</span>
                </div>
              ))}
            </div>
          </>
        </Reveal>
      </BentoCell>

      <BentoCell className="min-h-[14rem]">
        <Reveal delay={0.15}>
          <>
            <h3 className="dash-panel-title">Talep haritası</h3>
            <p className="dash-panel-desc">Bölgesel franchise ilgisi</p>
            <div className="turkey-heatmap mt-2">
              <svg viewBox="0 0 100 70" className="h-auto w-full" aria-label="Türkiye talep haritası">
                <path
                  d="M18 8 L35 6 L52 10 L68 8 L82 16 L88 28 L85 42 L78 55 L62 62 L45 65 L28 58 L12 48 L8 32 Z"
                  fill="rgba(255,107,74,0.06)"
                  stroke="rgba(255,107,74,0.2)"
                  strokeWidth="0.5"
                />
                {heatPoints.map((p) => (
                  <g key={p.name}>
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={4 + p.intensity * 8}
                      fill={`rgba(255, 107, 74, ${0.15 + p.intensity * 0.35})`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    />
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={2 + p.intensity * 2}
                      fill="#ff6b4a"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
                    />
                    <text x={p.x} y={p.y + 14} textAnchor="middle" fontSize="3.5" fill="var(--muted-foreground)">
                      {p.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </>
        </Reveal>
      </BentoCell>

      <BentoCell span="3" className="min-h-[18rem] p-0 overflow-hidden">
        <Reveal delay={0.2}>
          <div className="p-4 pb-0">
            <h3 className="dash-panel-title">Ekosistem ağı</h3>
            <p className="dash-panel-desc">Marka, başvurular ve şubeler — sürükleyerek keşfedin</p>
          </div>
          <EcosystemGraph summary={s} applications={applications} />
        </Reveal>
      </BentoCell>
    </BentoGrid>
  );
}
