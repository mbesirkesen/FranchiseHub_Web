"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/ui/auth-layout";
import { GlowInput } from "@/components/ui/glow-input";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { login } from "@/lib/api";
import { getRoleFromToken, setSession } from "@/lib/auth";
import { getUserFacingError } from "@/lib/form-errors";
import { getRoleRoute } from "@/lib/routes";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [roleParseError, setRoleParseError] = useState<string | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const role = getRoleFromToken(data.access_token);
      if (!role) {
        setRoleParseError("Bu hesap türü desteklenmiyor. Marka sahibi veya franchise arayan hesabı kullanın.");
        return;
      }
      setRoleParseError(null);
      setSession(data.access_token, role);
      router.replace(getRoleRoute(role));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <AuthLayout
      title="Tekrar hoş geldiniz"
      subtitle="Giriş sonrası rolünüze göre panele yönlendirilirsiniz."
      footer={
        <>
          <Link href="/forgot-password" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Şifremi unuttum
          </Link>
          <Link href="/register" className="block text-[var(--primary-hover)] hover:underline">
            Hesabınız yok mu? Kayıt olun
          </Link>
          <Link href="/" className="block text-[var(--muted)] hover:text-[var(--foreground)]">
            Ana sayfa
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => {
          setRoleParseError(null);
          mutate(values);
        })}
        className="space-y-4"
      >
        <GlowInput
          label="E-posta"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Şifre"
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {error ? (
          <p className="alert alert-error">
            {getUserFacingError(error, "Giriş başarısız. E-posta ve şifrenizi kontrol edin.")}
          </p>
        ) : null}
        {roleParseError ? <p className="alert alert-error">{roleParseError}</p> : null}

        <LoadingButton type="submit" loading={isPending} loadingText="Giriş yapılıyor">
          Giriş yap
        </LoadingButton>
      </form>
    </AuthLayout>
  );
}
