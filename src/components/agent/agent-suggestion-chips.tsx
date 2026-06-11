"use client";

import { AssistantSuggestion } from "@/lib/types";

type Props = {
  items: AssistantSuggestion[];
  disabled?: boolean;
  onSelect: (s: AssistantSuggestion) => void;
  className?: string;
};

export function AgentSuggestionChips({ items, disabled, onSelect, className }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={`agent-action-chips${className ? ` ${className}` : ""}`}>
      {items.map((s, index) => (
        <button
          key={`${s.action}-${s.brand_id ?? "none"}-${index}`}
          type="button"
          className="agent-action-chip"
          onClick={() => onSelect(s)}
          disabled={disabled}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
