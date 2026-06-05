"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";

type Props = {
  children: ReactNode;
};

function GuardLoading() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>
    </div>
  );
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      setAllowed(false);
      setChecked(true);
      router.replace("/login");
      return;
    }
    setAllowed(true);
    setChecked(true);
  }, [router]);

  if (!checked || !allowed) {
    return <GuardLoading />;
  }

  return <>{children}</>;
}
