"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { ApplicationStatus } from "@/lib/types";

const STEPS = [
  { id: "submitted", label: "Başvuru Alındı", hint: "Talebiniz sisteme kaydedildi" },
  { id: "review", label: "Ön İnceleme", hint: "Marka ekibi profilinizi inceliyor" },
  { id: "financial", label: "Finansal Değerlendirme", hint: "Yatırım uygunluğu değerlendiriliyor" },
  { id: "contract", label: "Sözleşme", hint: "Franchise sözleşmesi hazırlanıyor" },
  { id: "approved", label: "Onay", hint: "Bayi süreciniz tamamlandı" },
] as const;

type StepState = "done" | "active" | "pending" | "failed";

function daysSince(iso?: string): number {
  if (!iso) return 0;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.floor((Date.now() - ms) / 86_400_000));
}

export function getApplicationProgress(status: ApplicationStatus, createdAt?: string): number {
  const steps = resolveSteps(status, createdAt);
  const done = steps.filter((s) => s.state === "done").length;
  const active = steps.some((s) => s.state === "active");
  return Math.min(1, (done + (active ? 0.35 : 0)) / STEPS.length);
}

function resolveSteps(status: ApplicationStatus, createdAt?: string): { state: StepState; index: number }[] {
  const days = daysSince(createdAt);

  if (status === "approved") {
    return STEPS.map((_, i) => ({ state: "done" as StepState, index: i }));
  }

  if (status === "rejected") {
    const failAt = Math.min(3, Math.max(1, Math.floor(days / 2) + 1));
    return STEPS.map((_, i) => {
      if (i < failAt) return { state: "done", index: i };
      if (i === failAt) return { state: "failed", index: i };
      return { state: "pending", index: i };
    });
  }

  const activeIndex = Math.min(3, Math.floor(days / 2));
  return STEPS.map((_, i) => {
    if (i < activeIndex) return { state: "done", index: i };
    if (i === activeIndex) return { state: "active", index: i };
    return { state: "pending", index: i };
  });
}

type Props = {
  status: ApplicationStatus;
  createdAt?: string;
  horizontal?: boolean;
  variant?: "full" | "bar" | "micro";
};

export function ApplicationTimeline({ status, createdAt, horizontal, variant = "full" }: Props) {
  const steps = useMemo(() => resolveSteps(status, createdAt), [status, createdAt]);
  const progress = steps.filter((s) => s.state === "done").length / STEPS.length;
  const currentIndex = steps.findIndex((s) => s.state === "active" || s.state === "failed");
  const activeStep = STEPS[currentIndex >= 0 ? currentIndex : 0];

  if (variant === "micro") {
    return (
      <div className="app-timeline-micro" aria-label="Başvuru ilerlemesi">
        <div className="app-timeline-micro-track" aria-hidden>
          <motion.div
            className="app-timeline-micro-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: Math.max(progress, 0.06) }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div className="app-timeline-bar" aria-label="Başvuru ilerlemesi">
        <div className="app-timeline-bar-head">
          <span className="app-timeline-bar-phase">{activeStep.label}</span>
          <span className="app-timeline-bar-pct">{Math.round(progress * 100)}%</span>
        </div>
        <div className="app-timeline-bar-track" aria-hidden>
          <motion.div
            className="app-timeline-bar-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: Math.max(progress, 0.08) }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
          />
        </div>
        <div className="app-timeline-bar-dots" aria-hidden>
          {STEPS.map((step, i) => {
            const { state } = steps[i];
            return (
              <motion.span
                key={step.id}
                className={`app-timeline-bar-dot app-timeline-bar-dot-${state}`}
                title={step.label}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: state === "active" ? 1.15 : 1, opacity: 1 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={horizontal ? "app-timeline app-timeline-horizontal" : "app-timeline"}>
      <div className="app-timeline-track" aria-hidden>
        <motion.div
          className="app-timeline-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left center" }}
        />
      </div>

      <ol className="app-timeline-steps">
        {STEPS.map((step, i) => {
          const { state } = steps[i];
          return (
            <motion.li
              key={step.id}
              className={`app-timeline-step app-timeline-step-${state}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <motion.span
                className="app-timeline-dot"
                animate={
                  state === "done"
                    ? { scale: [1, 1.25, 1], boxShadow: ["0 0 0 rgba(22,163,74,0)", "0 0 20px rgba(22,163,74,0.45)", "0 0 8px rgba(22,163,74,0.2)"] }
                    : state === "active"
                      ? { scale: [1, 1.08, 1] }
                      : {}
                }
                transition={state === "done" ? { duration: 0.6, delay: i * 0.1 } : { duration: 2, repeat: Infinity }}
              >
                {state === "done" ? "✓" : state === "failed" ? "!" : i + 1}
              </motion.span>
              <div>
                <p className="app-timeline-label">{step.label}</p>
                {(state === "active" || state === "done") && (
                  <p className="app-timeline-hint">{step.hint}</p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
