import Link from "next/link";
import { ReactNode } from "react";
import { APPLICATION_STATUS_LABEL } from "@/lib/routes";

export function FriendlyHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 animate-fade-up">
      <h2 className="friendly-title">{title}</h2>
      {subtitle ? <p className="friendly-subtitle">{subtitle}</p> : null}
    </header>
  );
}

export function ActionTile({
  href,
  icon,
  title,
  description,
  accent = "gold",
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  accent?: "gold" | "teal" | "rose";
  badge?: string | number;
}) {
  return (
    <Link href={href} className={`action-tile action-tile-${accent}`}>
      <span className="action-tile-icon" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="action-tile-title">{title}</p>
          {badge != null && Number(badge) > 0 ? (
            <span className="action-tile-badge">{badge}</span>
          ) : null}
        </div>
        <p className="action-tile-desc">{description}</p>
      </div>
      <span className="action-tile-arrow" aria-hidden>
        →
      </span>
    </Link>
  );
}

export function StatusPill({ status, live }: { status: string; live?: boolean }) {
  const label = APPLICATION_STATUS_LABEL[status] ?? status;
  return (
    <span className={`status-pill status-pill-${status}${live ? " status-pill-live" : ""}`}>
      {live ? <span className="status-pill-dot" aria-hidden /> : null}
      {label}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden>
        {icon}
      </span>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PanelTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="panel-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={active === tab.id ? "panel-tab panel-tab-active" : "panel-tab"}
        >
          {tab.icon ? <span aria-hidden>{tab.icon}</span> : null}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function HelpBox({ children }: { children: ReactNode }) {
  return <div className="help-box">{children}</div>;
}
