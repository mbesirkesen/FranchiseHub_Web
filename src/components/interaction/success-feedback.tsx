"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  onClose?: () => void;
};

export function SuccessFeedback({ open, title, message, onClose }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="success-feedback"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          role="status"
        >
          <motion.span
            className="success-feedback-icon"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.05, duration: 0.45 }}
            aria-hidden
          >
            ✓
          </motion.span>
          <div>
            <p className="success-feedback-title">{title}</p>
            {message ? <p className="success-feedback-msg">{message}</p> : null}
          </div>
          {onClose ? (
            <button type="button" onClick={onClose} className="success-feedback-close" aria-label="Kapat">
              ×
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
