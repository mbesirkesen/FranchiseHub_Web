"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { MagneticButton } from "@/components/interaction/magnetic-button";
import { MarketingHeader } from "@/components/ui/marketing-header";

const steps = [
  {
    id: "discover",
    title: "Keşfet",
    body: "Sektör, şehir ve bütçeye göre markaları filtreleyin. Favorilere ekleyin, karşılaştırın.",
    visual: "01",
  },
  {
    id: "apply",
    title: "Başvur",
    body: "Beğendiğiniz markaya tek tıkla başvurun. Mesajlaşma ve durum takibi aynı panelde.",
    visual: "02",
  },
  {
    id: "review",
    title: "Değerlendir",
    body: "Marka sahibi başvuruyu inceler, onaylar veya geri bildirim gönderir — anlık bildirim alırsınız.",
    visual: "03",
  },
  {
    id: "operate",
    title: "Operasyon",
    body: "Onay sonrası depo, sipariş ve şube yönetimi tek çatı altında devam eder.",
    visual: "04",
  },
];

export function HowItWorksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const ringScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.95]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [1, 0.3, 1, 0.3, 1, 0.3]);

  return (
    <div className="page-shell">
      <MarketingHeader />
      <main ref={containerRef} className="scrolly-page">
        <section className="page-container py-16 md:py-24">
          <p className="landing-eyebrow">Süreç</p>
          <h1 className="friendly-title max-w-2xl">Franchise yolculuğu, kaydırdıkça açılıyor</h1>
          <p className="friendly-subtitle mt-3 max-w-xl">
            Metin duvarı yok — her adım ekranda canlanır. Aşağı kaydırın ve süreci adım adım izleyin.
          </p>
        </section>

        <div className="scrolly-layout page-container pb-24">
          <div className="scrolly-visual-sticky">
            <motion.div className="scrolly-orbit" style={{ rotate: ringRotate, scale: ringScale }}>
              <div className="scrolly-orbit-ring" />
              <div className="scrolly-orbit-core">
                <motion.span className="scrolly-orbit-label" style={{ opacity: coreOpacity }}>
                  FranchiseHub
                </motion.span>
              </div>
            </motion.div>
          </div>

          <div className="scrolly-steps">
            {steps.map((step, i) => (
              <ScrollyStep key={step.id} step={step} index={i} total={steps.length} />
            ))}
          </div>
        </div>

        <section className="page-container pb-24 text-center">
          <MagneticButton>
            <Link href="/register" className="btn-hero">
              Yolculuğa başla
            </Link>
          </MagneticButton>
        </section>
      </main>
    </div>
  );
}

function ScrollyStep({
  step,
  index,
  total,
}: {
  step: (typeof steps)[0];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.25, 1, 0.35]);
  const x = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -20]);
  const numScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1.15, 0.9]);

  return (
    <motion.article ref={ref} className="scrolly-step" style={{ opacity, x }}>
      <motion.span className="scrolly-step-num" style={{ scale: numScale }}>
        {step.visual}
      </motion.span>
      <div>
        <p className="scrolly-step-index">
          Adım {index + 1} / {total}
        </p>
        <h2 className="scrolly-step-title">{step.title}</h2>
        <p className="scrolly-step-body">{step.body}</p>
      </div>
    </motion.article>
  );
}
