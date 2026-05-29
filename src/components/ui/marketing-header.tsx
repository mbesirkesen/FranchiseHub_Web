"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header site-header-marketing${scrolled ? " site-header-scrolled" : ""}`}>
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="brand-mark">
          <span className="brand-mark-icon">FH</span>
          <span className="brand-mark-text">FranchiseHub</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/how-it-works" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            Nasıl çalışır?
          </Link>
          <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            Giriş
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Kayıt ol
          </Link>
        </nav>
      </div>
    </header>
  );
}
