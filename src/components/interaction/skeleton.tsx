type Props = {
  className?: string;
  lines?: number;
};

export function Skeleton({ className, lines = 1 }: Props) {
  if (lines <= 1) {
    return <div className={`skeleton ${className ?? ""}`} aria-hidden />;
  }
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-line ${className ?? ""}`} />
      ))}
    </div>
  );
}

export function SkeletonBento() {
  return (
    <div className="bento-grid" aria-busy aria-label="Yükleniyor">
      <div className="bento-cell bento-cell-glass bento-cell-span-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
      </div>
      <div className="bento-cell bento-cell-glass">
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="bento-cell bento-cell-glass">
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="bento-cell bento-cell-glass">
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="bento-cell bento-cell-glass bento-cell-span-2">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
