"use client";

import { getAccessToken, getUserRole } from "@/lib/auth";
import { getRoleRoute } from "@/lib/routes";
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  role: UserRole;
  children: ReactNode;
};

function GuardLoading() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p>
    </div>
  );
}

export function RoleGuard({ role, children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const currentRole = getUserRole();

    if (!token) {
      setAllowed(false);
      setChecked(true);
      router.replace("/login");
      return;
    }

    if (currentRole !== role) {
      setAllowed(false);
      setChecked(true);
      router.replace(currentRole ? getRoleRoute(currentRole) : "/login");
      return;
    }

    setAllowed(true);
    setChecked(true);
  }, [role, router]);

  if (!checked || !allowed) {
    return <GuardLoading />;
  }

  return <>{children}</>;
}
