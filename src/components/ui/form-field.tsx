import { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  labelExtra?: ReactNode;
  children: ReactNode;
};

export function FormField({ label, required, hint, error, labelExtra, children }: Props) {
  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-3">
        <label className="label mb-0">
          {label}
          {required ? (
            <span className="ml-0.5 text-[var(--danger)]" aria-hidden>
              *
            </span>
          ) : null}
          {required ? <span className="sr-only"> (zorunlu)</span> : null}
        </label>
        {labelExtra ? <div className="shrink-0">{labelExtra}</div> : null}
      </div>
      {hint ? <p className="mb-1 text-xs text-[var(--muted)]">{hint}</p> : null}
      {children}
      {error ? <p className="mt-1 text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
