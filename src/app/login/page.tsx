"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/api";
import { getRoleFromToken, setSession } from "@/lib/auth";
import { getRoleRoute } from "@/lib/routes";

const loginSchema = z.object({
  email: z.string().email("Gecerli bir email girin."),
  password: z.string().min(6, "Sifre en az 6 karakter olmali."),
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
        setRoleParseError("Token role alani okunamadi. Backend kontratini kontrol edin.");
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

  const onSubmit = (values: LoginFormValues) => {
    setRoleParseError(null);
    mutate({
      email: values.email,
      password: values.password,
    });
  };

  const backendErrorMessage = (() => {
    if (!error || !axios.isAxiosError(error)) {
      return null;
    }

    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          const loc = Array.isArray(item?.loc) ? item.loc.join(".") : "field";
          const msg = typeof item?.msg === "string" ? item.msg : "validation error";
          return `${loc}: ${msg}`;
        })
        .join(" | ");
    }

    return null;
  })();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md rounded-3xl p-7">
        <p className="script-title text-3xl text-cyan-300">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">FranchiseHub Giris</h1>
        <p className="mt-2 text-sm text-slate-300">Backend API ile bagli JWT giris ekrani.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-100">Email</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-xl border border-slate-500/40 bg-slate-950/40 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300"
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-100">Sifre</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-xl border border-slate-500/40 bg-slate-950/40 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300"
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <p className="text-xs text-slate-300">
              Rol secimi token icindeki `role` claim alanindan otomatik okunur.
            </p>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Giris basarisiz.
              {backendErrorMessage ? ` Detay: ${backendErrorMessage}` : " Backend loglarini kontrol edin."}
            </p>
          ) : null}
          {roleParseError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {roleParseError}
            </p>
          ) : null}

          <button
            disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Giris yapiliyor..." : "Giris Yap"}
          </button>
        </form>

        <Link href="/" className="mt-4 inline-block text-sm text-slate-300 underline">
          Ana sayfaya don
        </Link>
      </div>
    </div>
  );
}
