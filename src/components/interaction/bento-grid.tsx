import { HTMLAttributes, ReactNode } from "react";

type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export function BentoGrid({ children, className }: BentoGridProps) {
  return <div className={`bento-grid ${className ?? ""}`}>{children}</div>;
}

type BentoCellProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  span?: "1" | "2" | "3" | "row-2";
  glass?: boolean;
};

export function BentoCell({ children, className, span = "1", glass = true, ...rest }: BentoCellProps) {
  return (
    <div
      className={[
        "bento-cell",
        glass ? "bento-cell-glass" : "",
        span === "2" ? "bento-cell-span-2" : "",
        span === "3" ? "bento-cell-span-3" : "",
        span === "row-2" ? "bento-cell-row-2" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
