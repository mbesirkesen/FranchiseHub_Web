import { ReactElement } from "react";

type SectorId = "coffee" | "food" | "beauty" | "sport" | "retail" | "automotive";

const paths: Record<SectorId, ReactElement> = {
  coffee: (
    <>
      <path d="M6 8h8v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8Z" />
      <path d="M14 9h1.5a2 2 0 0 1 0 4H14" />
      <path d="M5 18h10" />
    </>
  ),
  food: (
    <>
      <path d="M5 11V5l2 2" />
      <path d="M5 5v6" />
      <path d="M11 5v13" />
      <path d="M11 9h5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5" />
    </>
  ),
  beauty: (
    <>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="M8.2 8.7 15.8 15.3" />
      <path d="m9 18 2-2" />
      <path d="m15 6-2 2" />
    </>
  ),
  sport: (
    <>
      <path d="M7 7h10v10H7z" />
      <path d="M7 12h10" />
      <path d="M12 7v10" />
    </>
  ),
  retail: (
    <>
      <path d="M6 8h12l-1.2 9H7.2L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  automotive: (
    <>
      <path d="M5 13h14l-1.5-4.5a1 1 0 0 0-.95-.7H7.45a1 1 0 0 0-.95.7L5 13Z" />
      <circle cx="8" cy="15" r="1.5" />
      <circle cx="16" cy="15" r="1.5" />
      <path d="M5 13v2" />
      <path d="M19 13v2" />
    </>
  ),
};

export function SectorIcon({ id, className }: { id: SectorId; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[id]}
    </svg>
  );
}

export type { SectorId };
