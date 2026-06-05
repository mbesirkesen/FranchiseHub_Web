"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SectorIcon, SectorId } from "@/components/landing/sector-icon";

const SECTORS: { label: string; icon: SectorId }[] = [
  { label: "Kahve", icon: "coffee" },
  { label: "Gıda", icon: "food" },
  { label: "Güzellik", icon: "beauty" },
  { label: "Spor", icon: "sport" },
  { label: "Perakende", icon: "retail" },
  { label: "Otomotiv", icon: "automotive" },
];

const MARQUEE_ITEMS = [...SECTORS, ...SECTORS];
const PX_PER_SECOND = 50;

export function SectorMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const loopStartRef = useRef<HTMLSpanElement>(null);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const loopStart = loopStartRef.current;
    if (!track || !loopStart) return;

    const measure = () => {
      const loop = loopStart.offsetLeft;
      if (loop > 0) {
        loopWidthRef.current = loop;
        setReady(true);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const track = trackRef.current;
    if (!track) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      track.style.transform = "";
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const loop = loopWidthRef.current;
      if (loop <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(now - last, 64) / 1000;
      last = now;

      offsetRef.current += PX_PER_SECOND * dt;
      if (offsetRef.current >= loop) {
        offsetRef.current -= loop;
      }

      track.style.transform = `translate3d(${offsetRef.current - loop}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <section
      className="landing-marquee-wrap border-y border-[var(--border)] bg-[var(--card)]"
      aria-label="Sektörler"
    >
      <div
        ref={trackRef}
        className={`landing-marquee-track${ready ? " landing-marquee-track-ready" : ""}`}
      >
        {MARQUEE_ITEMS.map((s, i) => (
          <span
            key={`${s.label}-${i}`}
            ref={i === SECTORS.length ? loopStartRef : undefined}
            className="landing-marquee-item"
            aria-hidden={i >= SECTORS.length ? true : undefined}
          >
            <SectorIcon id={s.icon} className="landing-marquee-icon" />
            {s.label}
          </span>
        ))}
      </div>
    </section>
  );
}
