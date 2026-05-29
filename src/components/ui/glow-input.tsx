"use client";

import { motion } from "framer-motion";
import { InputHTMLAttributes, forwardRef, useState } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const GlowInput = forwardRef<HTMLInputElement, Props>(function GlowInput(
  { label, error, className, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="glow-field">
      <label className="label">{label}</label>
      <div className="glow-field-wrap">
        <motion.span
          className="glow-field-ring"
          animate={{
            opacity: focused ? 1 : 0,
            scale: focused ? 1 : 0.98,
          }}
          transition={{ duration: 0.25 }}
          aria-hidden
        />
        <input
          ref={ref}
          {...props}
          className={`input glow-field-input ${className ?? ""}`}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
});
