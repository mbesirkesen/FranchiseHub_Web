"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";

type Props = {
  budget: number;
  matchCount: number;
  onChange: (v: number) => void;
};

export function BudgetSlider({ budget, matchCount, onChange }: Props) {
  return (
    <div className="budget-slider-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">Yatırım bütçeniz</p>
          <p className="text-xs text-[var(--muted)]">
            Maksimum bütçeniz — bu tutarı karşılayabileceğiniz markalar gösterilir
          </p>
        </div>
        <motion.p
          key={budget}
          initial={{ scale: 1.08, color: "var(--primary)" }}
          animate={{ scale: 1, color: "var(--foreground)" }}
          className="text-xl font-extrabold tabular-nums"
        >
          {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
            budget,
          )}
        </motion.p>
      </div>
      <input
        type="range"
        min={250_000}
        max={5_000_000}
        step={50_000}
        value={budget}
        onChange={(e) => onChange(Number(e.target.value))}
        className="budget-range mt-4"
      />
      <div className="mt-3 flex justify-between text-[10px] font-semibold text-[var(--muted)]">
        <span>250K ₺</span>
        <span>5M ₺</span>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        <CountUp key={matchCount} value={matchCount} /> marka bütçenizle uyumlu
      </p>
    </div>
  );
}
