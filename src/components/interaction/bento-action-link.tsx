"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { MagneticButton } from "@/components/interaction/magnetic-button";

type Props = {
  href: string;
  title: string;
  description: string;
  badge?: string | number;
  accent?: "gold" | "teal" | "rose" | "indigo";
  icon?: ReactNode;
  magnetic?: boolean;
};

const accentClass = {
  gold: "bento-action-gold",
  teal: "bento-action-teal",
  rose: "bento-action-rose",
  indigo: "bento-action-indigo",
};

export function BentoActionLink({
  href,
  title,
  description,
  badge,
  accent = "gold",
  icon,
  magnetic = true,
}: Props) {
  const inner = (
    <Link href={href} className={`bento-action ${accentClass[accent]}`}>
      {icon ? <span className="bento-action-icon">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="bento-action-title">{title}</p>
          {badge != null && Number(badge) > 0 ? (
            <span className="bento-action-badge">{badge}</span>
          ) : null}
        </div>
        <p className="bento-action-desc">{description}</p>
      </div>
      <span className="bento-action-arrow" aria-hidden>
        →
      </span>
    </Link>
  );

  if (magnetic) {
    return <MagneticButton strength={0.22}>{inner}</MagneticButton>;
  }
  return inner;
}
