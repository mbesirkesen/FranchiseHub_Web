"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "franchisehub.fo-onboarding.v1";

const STEPS = [
  {
    target: '[data-tour="fo-hero"]',
    title: "Platforma hoş geldiniz",
    body: "Marka paneliniz günlük işlerinizin merkezi. Bekleyen başvurular ve marka durumunuz burada özetlenir.",
  },
  {
    target: '[data-tour="fo-applications"]',
    title: "Başvuruları yönetin",
    body: "Aday yatırımcılar markanıza başvurduğunda buradan onaylayabilir, reddedebilir ve mesajlaşmaya geçebilirsiniz.",
  },
  {
    target: '[data-tour="fo-stock"]',
    title: "Tedarik yönetimi",
    body: "Bayi malzeme taleplerini onaylayın; merkez deposundaki stoku buradan yönetin.",
  },
  {
    target: '[data-tour="fo-ecosystem"]',
    title: "Ekosistem ağı",
    body: "Markanız, başvurular ve şubeler arasındaki ilişkiyi görselleştirir. Noktaları sürükleyerek keşfedin.",
  },
] as const;

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function measureTarget(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const pad = 8;
  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

export function FranchiseOwnerTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const updateSpotlight = useCallback(() => {
    const selector = STEPS[step]?.target;
    if (!selector) return;
    setSpotlight(measureTarget(selector));
  }, [step]);

  useEffect(() => {
    if (!visible) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const selector = STEPS[step]?.target;
    const el = selector ? document.querySelector(selector) : null;
    el?.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });

    const sync = () => {
      requestAnimationFrame(() => {
        updateSpotlight();
      });
    };

    sync();
    const t = window.setTimeout(sync, 50);

    let raf = 0;
    const onLayout = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateSpotlight);
    };

    window.addEventListener("resize", onLayout);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onLayout);
    };
  }, [visible, step, updateSpotlight]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setSpotlight(null);
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  if (!visible || !spotlight) return null;

  const current = STEPS[step];

  return (
    <div className="onboarding-root" role="dialog" aria-modal="true" aria-label="Platform turu">
      <button type="button" className="onboarding-backdrop" aria-label="Turu kapat" onClick={finish} />
      <div
        className="onboarding-spotlight"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
        }}
      />
      <div key={step} className="onboarding-card onboarding-card-docked">
        <p className="onboarding-step">
          {step + 1} / {STEPS.length}
        </p>
        <h3 className="onboarding-title">{current.title}</h3>
        <p className="onboarding-body">{current.body}</p>
        <div className="onboarding-actions">
          <button type="button" className="onboarding-skip" onClick={finish}>
            Atla
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={next}>
            {step >= STEPS.length - 1 ? "Başla" : "Devam"}
          </button>
        </div>
      </div>
    </div>
  );
}
