"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";

const rings = [
  { size: 280, delay: 0, breathDuration: 5.5 },
  { size: 220, delay: 0.15, breathDuration: 4.8 },
  { size: 160, delay: 0.3, breathDuration: 4.2 },
];

export function AuthShowcase() {
  return (
    <div className="auth-showcase-inner">
      <motion.div
        className="auth-showcase-orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
      >
        {rings.map((ring) => (
          <motion.span
            key={ring.size}
            className="auth-showcase-ring"
            style={{ width: ring.size, height: ring.size }}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{
              opacity: [0.35, 0.7, 0.35],
              scale: [0.96, 1.04, 0.96],
            }}
            transition={{
              opacity: { delay: ring.delay, duration: ring.breathDuration, repeat: Infinity, ease: "easeInOut" },
              scale: { delay: ring.delay, duration: ring.breathDuration, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
      </motion.div>

      <div className="auth-showcase-stats">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="auth-showcase-stat"
        >
          <p className="auth-showcase-stat-value">
            <CountUp value={100} suffix="%" />
          </p>
          <p className="auth-showcase-stat-label">Tek panel, net akış</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="auth-showcase-stat"
        >
          <p className="auth-showcase-stat-value">
            <CountUp value={2} />
          </p>
          <p className="auth-showcase-stat-label">Rol — otomatik yönlendirme</p>
        </motion.div>
      </div>

      <motion.p
        className="auth-showcase-quote"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        “Doğru markayı bul, büyümeye odaklan.”
      </motion.p>
    </div>
  );
}
