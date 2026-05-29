"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/ui/auth-layout";
import { GlowInput } from "@/components/ui/glow-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPassword } from "@/lib/api";
import { getUserFacingError } from "@/lib/form-errors";
import { passwordSchema } from "@/lib/form-schemas";

const schema = z.object({
  token: z.string().trim().min(1, "Sıfırlama kodu gerekli."),
  new_password: passwordSchema,
});

type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      resetPassword({ token: values.token.trim(), new_password: values.new_password }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: tokenFromUrl,
      new_password: "",
    },
  });

  const feedback = mutation.isSuccess
    ? { type: "success" as const, message: "Şifre güncellendi. Giriş yapabilirsiniz." }
    : mutation.isError
      ? {
          type: "error" as const,
          message: getUserFacingError(mutation.error, "Sıfırlama başarısız. Bağlantı süresi dolmuş olabilir."),
        }
      : null;

  return (
    <AuthLayout
      title="Yeni şifre belirleyin"
      subtitle="E-postanızdaki bağlantıdaki kodu ve yeni şifrenizi girin."
      footer={
        <>
          <p className="auth-footer-register">
            Şifrenizi güncellediniz mi?{" "}
            <Link href="/login" className="auth-footer-link-primary">
              Giriş yapın
            </Link>
          </p>
          <Link href="/forgot-password" className="auth-footer-home">
            Yeni sıfırlama bağlantısı iste
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => {
          mutation.reset();
          mutation.mutate(values);
        })}
        className="space-y-4"
      >
        {!tokenFromUrl ? (
          <GlowInput
            label="Sıfırlama kodu"
            required
            placeholder="E-postadaki kod veya token"
            error={errors.token?.message}
            {...register("token")}
          />
        ) : (
          <input type="hidden" {...register("token")} />
        )}

        <PasswordInput
          label="Yeni şifre"
          required
          autoComplete="new-password"
          hint="En az 8 karakter, harf ve rakam içermeli"
          error={errors.new_password?.message}
          {...register("new_password")}
        />

        {feedback ? (
          <p className={feedback.type === "success" ? "alert alert-success" : "alert alert-error"}>
            {feedback.message}
          </p>
        ) : null}

        <LoadingButton type="submit" loading={mutation.isPending} loadingText="Kaydediliyor">
          Şifreyi sıfırla
        </LoadingButton>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Yeni şifre belirleyin" subtitle="Yükleniyor…">
          <p className="text-sm text-[var(--muted)]">Sayfa hazırlanıyor…</p>
        </AuthLayout>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
