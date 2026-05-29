"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthLayout } from "@/components/ui/auth-layout";
import { GlowInput } from "@/components/ui/glow-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { forgotPassword } from "@/lib/api";
import { getUserFacingError } from "@/lib/form-errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: () => forgotPassword({ email: email.trim() }),
    onSuccess: () => {
      setFeedback({ type: "success", message: "Sıfırlama bağlantısı e-posta adresinize gönderildi." });
    },
    onError: (e) => {
      setFeedback({
        type: "error",
        message: getUserFacingError(e, "İstek gönderilemedi. E-posta adresinizi kontrol edin."),
      });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || mutation.isPending) return;
    setFeedback(null);
    mutation.mutate();
  };

  return (
    <AuthLayout
      title="Şifremi unuttum"
      subtitle="Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderelim."
      footer={
        <>
          <p className="auth-footer-register">
            Şifrenizi hatırladınız mı?{" "}
            <Link href="/login" className="auth-footer-link-primary">
              Giriş yapın
            </Link>
          </p>
          <Link href="/" className="auth-footer-home">
            Ana sayfa
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <GlowInput
          label="E-posta"
          type="email"
          required
          autoComplete="email"
          placeholder="ornek@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {feedback ? (
          <p className={feedback.type === "success" ? "alert alert-success" : "alert alert-error"}>
            {feedback.message}
          </p>
        ) : null}

        <LoadingButton type="submit" loading={mutation.isPending} loadingText="Gönderiliyor" disabled={!email.trim()}>
          Sıfırlama bağlantısı gönder
        </LoadingButton>
      </form>
    </AuthLayout>
  );
}
