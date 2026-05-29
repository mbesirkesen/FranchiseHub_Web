"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resetPassword } from "@/lib/api";
import { getBackendErrorMessage } from "@/lib/form-errors";

function ResetForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => resetPassword({ token: token.trim(), new_password: password }),
    onSuccess: () => setFeedback("Şifre güncellendi. Giriş yapabilirsiniz."),
    onError: (e) => setFeedback(getBackendErrorMessage(e) ?? "Sıfırlama başarısız."),
  });

  return (
    <div className="glass-card w-full max-w-md rounded-3xl p-7">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Yeni şifre</h1>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Reset token"
        className="mt-6 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Yeni şifre"
        className="mt-3 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
      />
      <button
        type="button"
        disabled={mutation.isPending || !token || password.length < 6}
        onClick={() => mutation.mutate()}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
      >
        Şifreyi sıfırla
      </button>
      {feedback ? <p className="mt-4 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
      <Link href="/login" className="mt-4 block text-sm text-[var(--primary-hover)] underline">
        Giriş
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<p className="text-[var(--muted)]">Yükleniyor…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
