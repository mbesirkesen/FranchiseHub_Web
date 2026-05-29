"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-lg rounded-3xl p-7">
        <Link href="/register" className="text-sm text-[var(--primary-hover)] hover:underline">
          ← Kayıt türü seç
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Franchise arayan kaydı</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          <span className="text-[var(--danger)]">*</span> ile işaretli alanlar zorunludur.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
          <FormField label="E-posta" required error={errors.email?.message}>
            <input type="email" autoComplete="email" placeholder="ornek@mail.com" {...register("email")} className="input" />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Ad" required error={errors.first_name?.message}>
              <input autoComplete="given-name" {...register("first_name")} className="input" />
            </FormField>
            <FormField label="Soyad" required error={errors.last_name?.message}>
              <input autoComplete="family-name" {...register("last_name")} className="input" />
            </FormField>
          </div>

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

          <FormField label="Tercih edilen sektör" required error={errors.sectorChoice?.message}>
            <select {...register("sectorChoice")} className="input">
              <option value="">Sektör seçin</option>
              {FRANCHISE_SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </FormField>

          {sectorChoice === SECTOR_OTHER ? (
            <FormField label="Sektör adı" required error={errors.sectorOther?.message}>
              <input
                {...register("sectorOther")}
                placeholder="Sektörünüzü yazın"
                className="input"
              />
            </FormField>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Yatırım bütçesi (₺)" required error={errors.investment_budget?.message}>
              <input
                type="number"
                min={0}
                step={10000}
                placeholder="1500000"
                {...register("investment_budget", { valueAsNumber: true })}
                className="input"
              />
            </FormField>
            <FormField label="Deneyim (yıl)" required error={errors.experience_years?.message}>
              <input
                type="number"
                min={0}
                {...register("experience_years", { valueAsNumber: true })}
                className="input"
              />
            </FormField>
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
                  className="input"
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

          <button type="submit" disabled={isPending} className="btn btn-primary btn-block">
            {isPending ? "Kaydediliyor…" : "Kayıt ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
