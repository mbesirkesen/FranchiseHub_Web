"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SectorIcon, SectorId } from "@/components/landing/sector-icon";
import { getPlatformStats } from "@/lib/api";

const SECTOR_ICON_MAP: Record<string, SectorId> = {
  kahve: "coffee",
  gıda: "food",
  restoran: "food",
  güzellik: "beauty",
  spor: "sport",
  perakende: "retail",
  otomotiv: "automotive",
};

function sectorIconFor(label: string): SectorId {
  const key = label.toLowerCase();
  for (const [part, icon] of Object.entries(SECTOR_ICON_MAP)) {
    if (key.includes(part)) return icon;
  }
  return "retail";
}

const PX_PER_SECOND = 50;

export function SectorMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const loopStartRef = useRef<HTMLSpanElement>(null);
  const loopWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const [ready, setReady] = useState(false);

  const statsQuery = useQuery({
    queryKey: ["platform-stats"],
    queryFn: getPlatformStats,
    staleTime: 1000 * 60 * 5,
  });

  const sectors = (statsQuery.data?.sectors ?? []).map((label) => ({
    label,
    icon: sectorIconFor(label),
  }));

  const marqueeItems = sectors.length > 0 ? [...sectors, ...sectors] : [];

  useLayoutEffect(() => {
    const track = trackRef.current;
    const loopStart = loopStartRef.current;
    if (!track || !loopStart || marqueeItems.length === 0) return;

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
  }, [marqueeItems.length]);

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

  if (marqueeItems.length === 0) {
    return null;
  }

  const half = sectors.length;

  return (
    <section
      className="landing-marquee-wrap border-y border-[var(--border)] bg-[var(--card)]"
      aria-label="Sektörler"
    >
      <div
        ref={trackRef}
        className={`landing-marquee-track${ready ? " landing-marquee-track-ready" : ""}`}
      >
        {marqueeItems.map((s, i) => (
          <span
            key={`${s.label}-${i}`}
            ref={i === half ? loopStartRef : undefined}
            className="landing-marquee-item"
            aria-hidden={i >= half ? true : undefined}
          >
            <SectorIcon id={s.icon} className="landing-marquee-icon" />
            {s.label}
          </span>
        ))}
      </div>
    </section>
  );
}
