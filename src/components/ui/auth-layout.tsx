"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { AuthShowcase } from "@/components/auth/auth-showcase";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="page-shell flex min-h-screen">
      <div className="auth-hero hidden w-[44%] flex-col justify-between p-12 lg:flex">
        <div className="auth-hero-content">
          <Link href="/" className="brand-mark">
            <span className="brand-mark-icon" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              FH
            </span>
            <span className="brand-mark-text text-white">FranchiseHub</span>
          </Link>
        </div>
        <AuthShowcase />
        <p className="auth-hero-content text-xs text-white/60">© FranchiseHub</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="brand-mark">
              <span className="brand-mark-icon">FH</span>
              <span className="brand-mark-text">FranchiseHub</span>
            </Link>
          </div>
          <div className="glass-form">
            <h1 className="display-title text-3xl text-[var(--foreground)]">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
          </div>
          {footer ? <div className="mt-6 space-y-2 text-center text-sm">{footer}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}
