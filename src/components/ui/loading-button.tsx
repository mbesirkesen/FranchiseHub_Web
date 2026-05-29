"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export function LoadingButton({
  loading,
  loadingText = "Yükleniyor…",
  children,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`btn btn-primary btn-block relative overflow-hidden ${className ?? ""}`}
    >
      <motion.span
        animate={{ opacity: loading ? 0 : 1, y: loading ? -8 : 0 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center justify-center gap-2"
      >
        {children}
      </motion.span>
      {loading ? (
        <motion.span
          className="loading-button-spinner"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          aria-hidden
        />
      ) : null}
      <span className="sr-only">{loading ? loadingText : undefined}</span>
    </button>
  );
}
