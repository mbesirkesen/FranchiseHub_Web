"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
};

const variants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
};

/** Hydration öncesi içerik görünür; HMR kopunca beyaz ekran olmaz. */
function useMotionReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}

export function Reveal({ children, delay = 0, className, direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionReady = useMotionReady();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={motionReady ? "hidden" : false}
      animate={motionReady ? (inView ? "visible" : "hidden") : false}
      variants={variants[direction]}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const motionReady = useMotionReady();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={motionReady ? "hidden" : false}
      animate={motionReady ? (inView ? "visible" : "hidden") : false}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const motionReady = useMotionReady();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      initial={motionReady ? "hidden" : false}
    >
      {children}
    </motion.div>
  );
}
