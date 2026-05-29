"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  label?: string;
  disabled?: boolean;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export function ExportMenu({
  label = "Dışa aktar",
  disabled = false,
  onExportCsv,
  onExportPdf,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const pick = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="export-menu">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-secondary btn-sm export-menu-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span aria-hidden>⬇</span>
        {label}
      </button>
      {open ? (
        <div className="export-menu-dropdown animate-pop-in" role="menu">
          <button type="button" role="menuitem" className="export-menu-item" onClick={() => pick(onExportCsv)}>
            CSV indir
          </button>
          <button type="button" role="menuitem" className="export-menu-item" onClick={() => pick(onExportPdf)}>
            PDF / yazdır
          </button>
        </div>
      ) : null}
    </div>
  );
}
