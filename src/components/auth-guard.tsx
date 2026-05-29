"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";

type Props = {
  children: ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(() => typeof window !== "undefined" && Boolean(getAccessToken()));

  useEffect(() => {
    if (!getAccessToken()) {
      setAllowed(false);
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
