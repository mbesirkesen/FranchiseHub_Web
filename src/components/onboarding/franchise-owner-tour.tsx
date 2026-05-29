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
    title: "Depo & sipariş",
    body: "Stoklarınızı takip edin, azalan ürünleri görün ve merkeze malzeme siparişi gönderin.",
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
    const el = document.querySelector(selector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    setSpotlight({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });
  }, [step]);

  useEffect(() => {
    if (!visible) return;
    const selector = STEPS[step]?.target;
    const el = selector ? document.querySelector(selector) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [visible, step, updateSpotlight]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
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
  const cardTop = Math.min(spotlight.top + spotlight.height + 16, window.innerHeight - 220);
  const cardLeft = Math.min(Math.max(spotlight.left, 16), window.innerWidth - 320);

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
      <div className="onboarding-card" style={{ top: cardTop, left: cardLeft }}>
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
