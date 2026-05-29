"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";
import { GlowInput } from "@/components/ui/glow-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthLayout } from "@/components/ui/auth-layout";
import { registerBuyer } from "@/lib/api";
import { passwordSchema } from "@/lib/form-schemas";
import { getUserFacingError } from "@/lib/form-errors";
import {
  FRANCHISE_SECTORS,
  SECTOR_OTHER,
  TR_CITIES,
  formatTcKimlik,
  formatTrMobilePhone,
  isValidTcKimlik,
  isValidTrMobilePhone,
  normalizeTcKimlik,
  normalizeTrMobilePhone,
  toTrMobilePhonePayload,
} from "@/lib/tr-form-data";

const schema = z
  .object({
    email: z.string().email("Geçerli bir e-posta adresi girin."),
    password: passwordSchema,
    first_name: z.string().trim().min(1, "Ad zorunludur."),
    last_name: z.string().trim().min(1, "Soyad zorunludur."),
    phone: z.string().min(1, "Telefon zorunludur.").refine(isValidTrMobilePhone, {
      message: "Cep telefonu (5XX) XXX XX XX formatında 10 haneli olmalı.",
    }),
    city: z.string().min(1, "Şehir seçin."),
    sectorChoice: z.string().min(1, "Sektör seçin."),
    sectorOther: z.string().optional(),
    investment_budget: z
      .number({ error: "Geçerli bir bütçe girin." })
      .min(1, "Yatırım bütçesi 0'dan büyük olmalı."),
    experience_years: z
      .number({ error: "Geçerli bir yıl girin." })
      .min(0, "Deneyim yılı 0 veya üzeri olmalı."),
    identity_number: z
      .string()
      .optional()
      .refine((v) => !v || normalizeTcKimlik(v).length === 0 || isValidTcKimlik(v), {
        message: "Geçerli 11 haneli T.C. kimlik numarası girin.",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.sectorChoice === SECTOR_OTHER) {
      const other = data.sectorOther?.trim() ?? "";
      if (other.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["sectorOther"],
          message: "Diğer sektör adını yazın (en az 2 karakter).",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterBuyerPage() {
  const router = useRouter();
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [tcDisplay, setTcDisplay] = useState("");

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: registerBuyer,
    onSuccess: () => {
      router.push("/login");
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      experience_years: 0,
      investment_budget: 0,
      sectorChoice: "",
      sectorOther: "",
      city: "",
    },
  });

  const sectorChoice = watch("sectorChoice");
  const backendError = error
    ? getUserFacingError(error, "Kayıt tamamlanamadı. Bilgilerinizi kontrol edip tekrar deneyin.")
    : null;

  const onSubmit = (values: FormValues) => {
    const preferred_sector =
      values.sectorChoice === SECTOR_OTHER
        ? (values.sectorOther?.trim() ?? "")
        : values.sectorChoice;

    mutate({
      email: values.email.trim(),
      password: values.password,
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: toTrMobilePhonePayload(values.phone),
      city: values.city,
      investment_budget: values.investment_budget,
      experience_years: values.experience_years,
      preferred_sector,
      identity_number: values.identity_number
        ? normalizeTcKimlik(values.identity_number)
        : undefined,
    });
  };

  return (
    <AuthLayout
      wide
      title="Franchise arayan kaydı"
      subtitle="Marka keşfedin, başvurun ve süreci tek panelden takip edin."
      footer={
        <>
          <p className="auth-footer-register">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="auth-footer-link-primary">
              Giriş yapın
            </Link>
          </p>
          <Link href="/register" className="auth-footer-home">
            ← Kayıt türü seç
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <GlowInput
          label="E-posta"
          type="email"
          required
          autoComplete="email"
          placeholder="ornek@mail.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <GlowInput
            label="Ad"
            required
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <GlowInput
            label="Soyad"
            required
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>

        <GlowInput
          label="Cep telefonu"
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(5XX) XXX XX XX"
          value={phoneDisplay}
          onChange={(e) => {
            const formatted = formatTrMobilePhone(e.target.value);
            setPhoneDisplay(formatted);
            setValue("phone", normalizeTrMobilePhone(formatted), { shouldValidate: true });
          }}
          error={errors.phone?.message}
        />

        <FormField label="Şehir" required error={errors.city?.message}>
          <select {...register("city")} className="input auth-focus-input">
            <option value="">Şehir seçin</option>
            {TR_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Tercih edilen sektör" required error={errors.sectorChoice?.message}>
          <select {...register("sectorChoice")} className="input auth-focus-input">
            <option value="">Sektör seçin</option>
            {FRANCHISE_SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </FormField>

        {sectorChoice === SECTOR_OTHER ? (
          <GlowInput
            label="Sektör adı"
            required
            placeholder="Sektörünüzü yazın"
            error={errors.sectorOther?.message}
            {...register("sectorOther")}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <GlowInput
            label="Yatırım bütçesi (₺)"
            required
            type="number"
            min={0}
            step={10000}
            placeholder="1500000"
            error={errors.investment_budget?.message}
            {...register("investment_budget", { valueAsNumber: true })}
          />
          <GlowInput
            label="Deneyim (yıl)"
            required
            type="number"
            min={0}
            error={errors.experience_years?.message}
            {...register("experience_years", { valueAsNumber: true })}
          />
        </div>

        <FormField
          label="T.C. kimlik no"
          hint="11 haneli — isteğe bağlı"
          error={errors.identity_number?.message}
        >
          <Controller
            control={control}
            name="identity_number"
            render={({ field }) => (
              <input
                type="text"
                inputMode="numeric"
                placeholder="XXX XXX XXX XX"
                value={tcDisplay}
                onChange={(e) => {
                  const formatted = formatTcKimlik(e.target.value);
                  setTcDisplay(formatted);
                  field.onChange(normalizeTcKimlik(formatted));
                }}
                className="input auth-focus-input"
              />
            )}
          />
        </FormField>

        <PasswordInput
          label="Şifre"
          required
          hint="En az 8 karakter, harf ve rakam içermeli"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {backendError ? <p className="alert alert-error">{backendError}</p> : null}
        {isSuccess ? (
          <p className="alert alert-success">Kayıt tamamlandı. Giriş sayfasına yönlendiriliyorsunuz…</p>
        ) : null}

        <LoadingButton type="submit" loading={isPending} loadingText="Kaydediliyor">
          Kayıt ol
        </LoadingButton>
      </form>
    </AuthLayout>
  );
}
