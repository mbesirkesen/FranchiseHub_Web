"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { getBackendErrorMessage } from "@/lib/form-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => forgotPassword({ email: email.trim() }),
    onSuccess: () => setFeedback("Sıfırlama bağlantısı e-posta adresinize gönderildi."),
    onError: (e) => setFeedback(getBackendErrorMessage(e) ?? "İstek gönderilemedi."),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card w-full max-w-md rounded-3xl p-7">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Şifremi unuttum</h1>
        <p className="page-desc">E-posta ile sıfırlama bağlantısı alın.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@ornek.com"
          className="mt-6 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
        />
        <button
          type="button"
          disabled={mutation.isPending || !email.trim()}
          onClick={() => mutation.mutate()}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          Gönder
        </button>
        {feedback ? <p className="mt-4 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
        <Link href="/login" className="mt-4 block text-sm text-[var(--primary-hover)] underline">
          Girişe dön
        </Link>
      </div>
    </div>
  );
}
