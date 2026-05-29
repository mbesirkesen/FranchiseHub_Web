"use client";

import { ReactNode } from "react";
import { BentoCell } from "@/components/interaction/bento-grid";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

type Props = {
  label: string;
  value: number;
  watermark: string;
  delay?: number;
  valueClassName?: string;
  children?: ReactNode;
};

export function BentoMetricCell({
  label,
  value,
  watermark,
  delay = 0,
  valueClassName,
  children,
}: Props) {
  return (
    <BentoCell className="bento-metric">
      <span className="bento-metric-watermark" aria-hidden>
        {watermark}
      </span>
      <Reveal delay={delay}>
        <p className="bento-metric-label">{label}</p>
        <p className={`bento-metric-value relative z-[1]${valueClassName ? ` ${valueClassName}` : ""}`}>
          {children ?? <CountUp value={value} />}
        </p>
      </Reveal>
    </BentoCell>
  );
}
