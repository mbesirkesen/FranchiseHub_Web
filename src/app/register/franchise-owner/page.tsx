"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";
import { GlowInput } from "@/components/ui/glow-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthLayout } from "@/components/ui/auth-layout";
import { registerFranchiseOwner } from "@/lib/api";
import { passwordSchema } from "@/lib/form-schemas";
import { getUserFacingError } from "@/lib/form-errors";
import {
  TR_CITIES,
  TR_COUNTRIES,
  formatTaxNumber,
  formatTrMobilePhone,
  isValidTaxNumber,
  isValidTrMobilePhone,
  normalizeTaxNumber,
  normalizeTrMobilePhone,
  toTrMobilePhonePayload,
} from "@/lib/tr-form-data";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: passwordSchema,
  company_name: z.string().trim().min(1, "Şirket adı zorunludur."),
  tax_number: z
    .string()
    .min(1, "Vergi numarası zorunludur.")
    .refine(isValidTaxNumber, { message: "Vergi numarası 10 haneli olmalı (XXX XXX XX XX)." }),
  phone: z.string().min(1, "Telefon zorunludur.").refine(isValidTrMobilePhone, {
    message: "Cep telefonu (5XX) XXX XX XX formatında 10 haneli olmalı.",
  }),
  authorized_person_name: z.string().trim().min(1, "Yetkili adı zorunludur."),
  country: z.string().min(1, "Ülke seçin."),
  city: z.string().min(1, "Şehir seçin."),
  company_address: z.string().trim().min(1, "Şirket adresi zorunludur."),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterFranchiseOwnerPage() {
  const router = useRouter();
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [taxDisplay, setTaxDisplay] = useState("");

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: registerFranchiseOwner,
    onSuccess: () => {
      router.push("/login");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: "Türkiye",
      city: "",
      tax_number: "",
      phone: "",
    },
  });

  const backendError = error
    ? getUserFacingError(error, "Kayıt tamamlanamadı. Bilgilerinizi kontrol edip tekrar deneyin.")
    : null;

  const onSubmit = (values: FormValues) => {
    mutate({
      email: values.email.trim(),
      password: values.password,
      company_name: values.company_name.trim(),
      tax_number: normalizeTaxNumber(values.tax_number),
      phone: toTrMobilePhonePayload(values.phone),
      authorized_person_name: values.authorized_person_name.trim(),
      country: values.country,
      city: values.city,
      company_address: values.company_address.trim(),
      website: values.website?.trim() || undefined,
    });
  };

  return (
    <AuthLayout
      wide
      title="Marka sahibi kaydı"
      subtitle="Franchise markanızı yönetin, başvuruları ve operasyonu tek panelden takip edin."
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
          placeholder="ornek@sirket.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <GlowInput
          label="Şirket adı"
          required
          error={errors.company_name?.message}
          {...register("company_name")}
        />

        <GlowInput
          label="Vergi numarası"
          required
          type="text"
          inputMode="numeric"
          placeholder="XXX XXX XX XX"
          value={taxDisplay}
          onChange={(e) => {
            const formatted = formatTaxNumber(e.target.value);
            setTaxDisplay(formatted);
            setValue("tax_number", normalizeTaxNumber(formatted), { shouldValidate: true });
          }}
          error={errors.tax_number?.message}
        />

        <GlowInput
          label="Yetkili kişi"
          required
          error={errors.authorized_person_name?.message}
          {...register("authorized_person_name")}
        />

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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ülke" required error={errors.country?.message}>
            <select {...register("country")} className="input auth-focus-input">
              {TR_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
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
        </div>

        <FormField label="Şirket adresi" required error={errors.company_address?.message}>
          <textarea {...register("company_address")} rows={2} className="textarea auth-focus-input" />
        </FormField>

        <GlowInput
          label="Web sitesi"
          type="url"
          placeholder="https://..."
          error={errors.website?.message}
          {...register("website")}
        />

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
