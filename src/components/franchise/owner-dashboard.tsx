"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Reveal } from "@/components/motion/reveal";
import { EcosystemGraph } from "@/components/franchise/ecosystem-graph";
import { BentoCell, BentoGrid } from "@/components/interaction/bento-grid";
import { BentoMetricCell } from "@/components/interaction/bento-metric-cell";
import { Skeleton } from "@/components/interaction/skeleton";
import { getFranchiseEcosystem, getFranchiseGeography } from "@/lib/api";
import { FranchiseDashboardSummary } from "@/lib/types";

type Props = {
  summary: FranchiseDashboardSummary | undefined;
  loading?: boolean;
};

export function FranchiseOwnerDashboard({ summary, loading }: Props) {
  const s = summary;

  const geographyQuery = useQuery({
    queryKey: ["franchise-geography"],
    queryFn: () => getFranchiseGeography(30),
  });

  const ecosystemQuery = useQuery({
    queryKey: ["franchise-ecosystem"],
    queryFn: getFranchiseEcosystem,
  });

  const chartData = useMemo(
    () => [
      { label: "Bekleyen", value: s?.pending_applications ?? 0, color: "#f59e0b" },
      { label: "Onaylı", value: s?.approved_applications ?? 0, color: "#22c55e" },
      { label: "Reddedilen", value: s?.rejected_applications ?? 0, color: "#ef4444" },
    ],
    [s],
  );
  const maxBar = Math.max(...chartData.map((d) => d.value), 1);

  const geoPoints = geographyQuery.data?.points ?? [];
  const maxGeo = Math.max(...geoPoints.map((p) => p.application_count), 1);

  const metrics = [
    { label: "Toplam başvuru", value: s?.total_applications ?? 0, watermark: "📄" },
    { label: "Bekleyen", value: s?.pending_applications ?? 0, watermark: "⏳" },
    { label: "Onaylı", value: s?.approved_applications ?? 0, watermark: "✓" },
    { label: "Depo kalemi", value: s?.inventory_item_count ?? 0, watermark: "📦" },
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
        <BentoMetricCell
          key={m.label}
          label={m.label}
          value={m.value}
          watermark={m.watermark}
          delay={i * 0.05}
        />
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
            <p className="dash-panel-desc">
              Son {geographyQuery.data?.period_days ?? 30} gün — şehir bazlı başvuru
            </p>
            {geographyQuery.isLoading ? (
              <Skeleton className="mt-4 h-24 w-full" />
            ) : geoPoints.length === 0 ? (
              <p className="mt-4 text-xs text-[var(--muted-foreground)]">Henüz coğrafi başvuru verisi yok.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {geoPoints.slice(0, 6).map((p) => (
                  <li key={p.city}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{p.city}</span>
                      <span className="text-[var(--muted-foreground)]">{p.application_count} başvuru</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.application_count / maxGeo) * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        </Reveal>
      </BentoCell>

      <BentoCell span="3" className="min-h-[18rem] p-0 overflow-hidden" data-tour="fo-ecosystem">
        <Reveal delay={0.2}>
          <div className="p-4 pb-0">
            <h3 className="dash-panel-title">Ekosistem ağı</h3>
            <p className="dash-panel-desc">Marka, başvurular ve şubeler — sürükleyerek keşfedin</p>
          </div>
          {ecosystemQuery.isLoading ? (
            <Skeleton className="mx-4 mb-4 h-48 w-auto" />
          ) : (
            <EcosystemGraph ecosystem={ecosystemQuery.data} brandName={s?.brand_name} />
          )}
        </Reveal>
      </BentoCell>
    </BentoGrid>
  );
}
