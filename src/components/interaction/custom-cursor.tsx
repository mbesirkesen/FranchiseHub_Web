"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

type CursorMode = "default" | "button" | "view";

const INTERACTIVE =
  'a, button, [role="button"], .btn, input[type="submit"], input[type="button"], label[for], .bento-action, .action-tile, .nav-tile, .cmd-palette-item, .cmd-k-trigger, .brand-opportunity-card';

const VIEWABLE = "img, picture, [data-cursor-view], .brand-opportunity-card img";

const TEXT_FIELD = 'input:not([type="submit"]):not([type="button"]), textarea, select, [contenteditable="true"]';

function resolveMode(target: EventTarget | null): CursorMode | null {
  if (!(target instanceof Element)) return "default";
  if (target.closest(TEXT_FIELD)) return null;
  if (target.closest(VIEWABLE)) return "view";
  if (target.closest(INTERACTIVE)) return "button";
  return "default";
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 520, damping: 42, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 520, damping: 42, mass: 0.45 });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const next = resolveMode(e.target);
      if (next === null) {
        setPaused(true);
        return;
      }
      setPaused(false);
      setMode(next);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [x, y]);

  useEffect(() => {
    if (!enabled) return;
    if (paused) {
      document.body.classList.remove("custom-cursor-active");
    } else {
      document.body.classList.add("custom-cursor-active");
    }
  }, [enabled, paused]);

  if (!enabled || paused) return null;

  const ringSize = mode === "button" ? 52 : mode === "view" ? 64 : 28;

  return (
    <div className="custom-cursor-root" aria-hidden>
      <motion.div
        className="custom-cursor-ring"
        style={{ x: springX, y: springY }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      />

      <motion.div
        className="custom-cursor-dot"
        style={{ x: springX, y: springY }}
        animate={{
          scale: mode === "button" ? 0 : mode === "view" ? 0 : 1,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />

      <AnimatePresence>
        {mode === "view" && visible ? (
          <motion.span
            className="custom-cursor-label"
            style={{ x: springX, y: springY }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            Görüntüle
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
