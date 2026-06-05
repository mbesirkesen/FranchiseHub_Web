"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GlowInput } from "@/components/ui/glow-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/interaction/skeleton";
import { changePassword, getMe, updateMe } from "@/lib/api";
import { getUserRole } from "@/lib/auth";
import { getUserFacingError } from "@/lib/form-errors";
import { getRoleRoute } from "@/lib/routes";
import { UserProfile } from "@/lib/types";

function profileToFormFields(profile: UserProfile) {
  let firstName = profile.first_name?.trim() ?? "";
  let lastName = profile.last_name?.trim() ?? "";

  if (!firstName && !lastName && profile.full_name?.trim()) {
    const parts = profile.full_name.trim().split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  return {
    firstName,
    lastName,
    phone: profile.phone ?? "",
    city: profile.city ?? "",
  };
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const role = getUserRole();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formReady, setFormReady] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    retry: false,
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    const fields = profileToFormFields(profileQuery.data);
    setFirstName(fields.firstName);
    setLastName(fields.lastName);
    setPhone(fields.phone);
    setCity(fields.city);
    setFormReady(true);
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMe({
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      }),
    onSuccess: () => {
      setFeedback("Profil güncellendi.");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => setFeedback(getUserFacingError(e, "Güncelleme başarısız.")),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ current_password: currentPassword, new_password: newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setFeedback("Şifre değiştirildi.");
    },
    onError: (e) => setFeedback(getUserFacingError(e, "Şifre değiştirilemedi.")),
  });

  const profile = profileQuery.data;
  const loading = profileQuery.isLoading || (!profileQuery.isError && !formReady);

  return (
    <div className="card p-6 md:p-7">
      <h1 className="page-title">Profil</h1>
      {profileQuery.isError ? (
        <p className="mt-2 alert alert-error">Profil yüklenemedi. Oturumunuzu kontrol edip tekrar deneyin.</p>
      ) : null}
      {profile?.email ? <p className="page-desc">{profile.email}</p> : null}
      {role ? (
        <Link href={getRoleRoute(role)} className="mt-2 inline-block text-sm font-medium text-[var(--primary-hover)] underline-offset-2 hover:underline">
          Panele dön
        </Link>
      ) : null}

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Kişisel bilgiler</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <GlowInput label="Ad" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            <GlowInput label="Soyad" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            <GlowInput label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            <GlowInput label="Şehir" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
            <LoadingButton
              type="button"
              loading={updateMutation.isPending}
              loadingText="Kaydediliyor…"
              onClick={() => updateMutation.mutate()}
              className="w-fit"
            >
              Kaydet
            </LoadingButton>
          </>
        )}
      </section>

      <section className="mt-8 space-y-4 border-t border-[var(--border)] pt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Şifre değiştir</h2>
        <PasswordInput label="Mevcut şifre" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
        <PasswordInput label="Yeni şifre" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        <button
          type="button"
          disabled={passwordMutation.isPending || !currentPassword || !newPassword}
          onClick={() => passwordMutation.mutate()}
          className="btn btn-secondary btn-sm disabled:opacity-50"
        >
          {passwordMutation.isPending ? "Güncelleniyor…" : "Şifreyi güncelle"}
        </button>
      </section>

      {feedback ? (
        <p className={`mt-6 text-sm ${feedback.includes("başarısız") || feedback.includes("değiştirilemedi") ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
