"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "Kriterlere uygun markalar taranıyor…",
  "Bütçe ve bölge filtreleri uygulanıyor…",
  "Franchise veritabanı taranıyor…",
  "En iyi eşleşmeler sıralanıyor…",
];

export function AgentThinking() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="agent-bubble agent-bubble-ai agent-thinking-bubble"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="agent-thinking-row">
        <span className="agent-thinking-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className="agent-thinking-label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            {STATUS_MESSAGES[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
