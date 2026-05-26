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

function clientMayRender(role: UserRole): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const token = getAccessToken();
  const currentRole = getUserRole();
  return Boolean(token && currentRole === role);
}

export function RoleGuard({ role, children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(() => clientMayRender(role));

  useEffect(() => {
    const token = getAccessToken();
    const currentRole = getUserRole();

    if (!token) {
      setAllowed(false);
      router.replace("/login");
      return;
    }

    if (currentRole !== role) {
      setAllowed(false);
      router.replace(currentRole ? getRoleRoute(currentRole) : "/login");
      return;
    }

    setAllowed(true);
  }, [role, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
