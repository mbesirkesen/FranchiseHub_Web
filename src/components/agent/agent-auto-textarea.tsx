"use client";

import { TextareaHTMLAttributes, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

const LINE_HEIGHT_PX = 22;
const MAX_LINES = 4;
const VERTICAL_PADDING_PX = 16;

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> & {
  onEnterSubmit?: () => void;
};

export const AgentAutoTextarea = forwardRef<HTMLTextAreaElement, Props>(function AgentAutoTextarea(
  { onEnterSubmit, onChange, onKeyDown, className, value, ...props },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = LINE_HEIGHT_PX * MAX_LINES + VERTICAL_PADDING_PX;
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={innerRef}
      rows={1}
      value={value}
      {...props}
      className={`agent-panel-input agent-panel-textarea ${className ?? ""}`}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onEnterSubmit?.();
        }
      }}
    />
  );
});
