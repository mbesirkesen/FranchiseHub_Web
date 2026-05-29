import { Suspense } from "react";
import FranchiseStockPage from "./stock-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>}>
      <FranchiseStockPage />
    </Suspense>
  );
}
