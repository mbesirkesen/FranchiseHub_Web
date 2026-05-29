"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { NetworkGlobe } from "@/components/motion/network-globe";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { MarketingHeader } from "@/components/ui/marketing-header";

const stats = [
  { value: 2, suffix: " rol", label: "Marka sahibi & franchise arayan" },
  { value: 1, suffix: " platform", label: "Keşif, başvuru, operasyon" },
  { value: 100, suffix: "%", label: "Mobil uyumlu panel" },
];

const stories = [
  {
    quote: "Başvuruları tek ekrandan onaylıyorum — telefon trafiği yarıya indi.",
    role: "Marka sahibi · Gıda",
  },
  {
    quote: "Bütçeme uygun markaları dakikalar içinde filtreledim, aynı gün başvurdum.",
    role: "Franchise arayan · İstanbul",
  },
  {
    quote: "Depo ve sipariş aynı yerde — ekstra program öğrenmedik.",
    role: "Marka sahibi · Perakende",
  },
];

const sectors = ["☕ Kahve", "🍔 Gıda", "💇 Güzellik", "🏋️ Spor", "🛒 Perakende", "🚗 Otomotiv"];

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <div className="page-shell">
      <MarketingHeader />

      <main>
        <section ref={heroRef} className="landing-hero">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="landing-hero-bg">
            <NetworkGlobe className="h-full w-full" />
          </motion.div>
          <div className="landing-hero-overlay" aria-hidden />

          <div className="page-container relative z-10 flex min-h-[88vh] flex-col items-center justify-center py-20 text-center">
            <Reveal>
              <p className="landing-eyebrow">Franchise ekosistemi</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="landing-headline">
                Türkiye&apos;nin franchise
                <span className="landing-headline-gradient"> ağına</span> katıl.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="landing-subline mx-auto mt-6 max-w-2xl">
                Marka sahibi misiniz, yatırımcı mı? Tek giriş — size özel panel. Keşif, başvuru ve
                günlük operasyon bir arada.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/register" className="btn-hero">
                  Hemen başla
                </Link>
                <Link href="/how-it-works" className="btn btn-secondary btn-lg">
                  Nasıl çalışır?
                </Link>
                <Link href="/login" className="btn btn-ghost btn-lg">
                  Giriş yap
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="landing-stats">
          <div className="page-container">
            <StaggerReveal className="grid gap-8 md:grid-cols-3">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="landing-stat-card">
                    <p className="landing-stat-value">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="landing-stat-label">{s.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>

        <section className="landing-marquee-wrap border-y border-[var(--border)] bg-[var(--card)]">
          <div className="landing-marquee">
            {[...sectors, ...sectors].map((s, i) => (
              <span key={`${s}-${i}`} className="landing-marquee-item">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="page-container py-20 md:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="landing-section-title">Neden FranchiseHub?</h2>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Sade arayüz, güçlü animasyonlar, gerçek iş akışları.
            </p>
          </Reveal>
          <StaggerReveal className="mt-14 grid gap-6 md:grid-cols-3">
            <StaggerItem>
              <div className="landing-feature">
                <span className="landing-feature-icon">🔍</span>
                <h3>Keşif</h3>
                <p>Bütçe ve sektöre göre marka avı — kartlar ve canlı filtreler.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="landing-feature">
                <span className="landing-feature-icon">📋</span>
                <h3>Başvuru</h3>
                <p>Tek tıkla başvur, mesajla takip et, onaylanınca bayi moduna geç.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="landing-feature">
                <span className="landing-feature-icon">📦</span>
                <h3>Operasyon</h3>
                <p>Marka sahibi için başvuru, depo ve sipariş — hepsi panelde.</p>
              </div>
            </StaggerItem>
          </StaggerReveal>
        </section>

        <section className="bg-[var(--bg-subtle)] py-20 md:py-28">
          <div className="page-container">
            <Reveal>
              <h2 className="landing-section-title text-center">Sahadan sesler</h2>
            </Reveal>
            <StaggerReveal className="mt-12 grid gap-6 md:grid-cols-3">
              {stories.map((s) => (
                <StaggerItem key={s.role}>
                  <blockquote className="landing-story">
                    <p>&ldquo;{s.quote}&rdquo;</p>
                    <footer>{s.role}</footer>
                  </blockquote>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>

        <section className="page-container py-20">
          <Reveal>
            <div className="landing-cta">
              <h2 className="landing-cta-title">Ekosisteme katıl.</h2>
              <p className="landing-cta-desc">Kayıt 2 dakika — giriş sonrası otomatik yönlendirme.</p>
              <Link href="/register" className="btn-hero mt-8">
                Ücretsiz başla
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
