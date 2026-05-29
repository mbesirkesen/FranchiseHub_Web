import { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, required, hint, error, children }: Props) {
  return (
    <div>
      <label className="label">
        {label}
        {required ? (
          <span className="ml-0.5 text-[var(--danger)]" aria-hidden>
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (zorunlu)</span> : null}
      </label>
      {hint ? <p className="mb-1 text-xs text-[var(--muted)]">{hint}</p> : null}
      {children}
      {error ? <p className="mt-1 text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
