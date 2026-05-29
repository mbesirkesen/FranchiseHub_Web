import { ReactNode } from "react";

export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header className="mb-8">
      <h2 className="page-title">{title}</h2>
      {description ? <p className="page-desc">{description}</p> : null}
    </header>
  );
}

export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card-muted p-5">
      {title ? <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3> : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}
