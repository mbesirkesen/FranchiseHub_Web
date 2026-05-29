"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-lg rounded-3xl p-7">
        <Link href="/register" className="text-sm text-[var(--primary-hover)] hover:underline">
          ← Kayıt türü seç
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Marka sahibi kaydı</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          <span className="text-[var(--danger)]">*</span> ile işaretli alanlar zorunludur.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
          <FormField label="E-posta" required error={errors.email?.message}>
            <input type="email" autoComplete="email" placeholder="ornek@sirket.com" {...register("email")} className="input" />
          </FormField>

          <FormField label="Şirket adı" required error={errors.company_name?.message}>
            <input {...register("company_name")} className="input" />
          </FormField>

          <FormField
            label="Vergi numarası"
            required
            hint="10 haneli — XXX XXX XX XX"
            error={errors.tax_number?.message}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="XXX XXX XX XX"
              value={taxDisplay}
              onChange={(e) => {
                const formatted = formatTaxNumber(e.target.value);
                setTaxDisplay(formatted);
                setValue("tax_number", normalizeTaxNumber(formatted), { shouldValidate: true });
              }}
              className="input"
            />
          </FormField>

          <FormField label="Yetkili kişi" required error={errors.authorized_person_name?.message}>
            <input {...register("authorized_person_name")} className="input" />
          </FormField>

          <FormField
            label="Cep telefonu"
            required
            hint="Örn: (532) 123 45 67"
            error={errors.phone?.message}
          >
            <input
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
              className="input"
            />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Ülke" required error={errors.country?.message}>
              <select {...register("country")} className="input">
                {TR_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Şehir" required error={errors.city?.message}>
              <select {...register("city")} className="input">
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
            <textarea {...register("company_address")} rows={2} className="textarea" />
          </FormField>

          <FormField label="Web sitesi" hint="İsteğe bağlı" error={errors.website?.message}>
            <input type="url" placeholder="https://..." {...register("website")} className="input" />
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

          <button type="submit" disabled={isPending} className="btn btn-primary btn-block">
            {isPending ? "Kaydediliyor…" : "Kayıt ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
