"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { changePassword, getMe, updateMe } from "@/lib/api";
import { getBackendErrorMessage } from "@/lib/form-errors";
import { getRoleRoute } from "@/lib/routes";
import { getUserRole } from "@/lib/auth";

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

  const profileQuery = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const data = await getMe();
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setPhone(data.phone ?? "");
      setCity(data.city ?? "");
      return data;
    },
    retry: false,
  });

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
      queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    },
    onError: (e) => setFeedback(getBackendErrorMessage(e) ?? "Güncelleme başarısız."),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword({ current_password: currentPassword, new_password: newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setFeedback("Şifre değiştirildi.");
    },
    onError: (e) => setFeedback(getBackendErrorMessage(e) ?? "Şifre değiştirilemedi."),
  });

  const profile = profileQuery.data;

  return (
    <div className="glass-card rounded-3xl p-7">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Profil</h1>
      {profileQuery.isError ? (
        <p className="mt-2 text-[var(--danger)]">Profil yüklenemedi.</p>
      ) : null}
      {profile?.email ? <p className="page-desc">{profile.email}</p> : null}
      {role ? (
        <Link href={getRoleRoute(role)} className="mt-2 inline-block text-sm text-[var(--primary-hover)] underline">
          Panele dön
        </Link>
      ) : null}

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Kişisel bilgiler</h2>
        <Input label="Ad" value={firstName} onChange={setFirstName} />
        <Input label="Soyad" value={lastName} onChange={setLastName} />
        <Input label="Telefon" value={phone} onChange={setPhone} />
        <Input label="Şehir" value={city} onChange={setCity} />
        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          Kaydet
        </button>
      </section>

      <section className="mt-8 space-y-3 border-t border-[var(--border)] pt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Şifre değiştir</h2>
        <Input label="Mevcut şifre" value={currentPassword} onChange={setCurrentPassword} type="password" />
        <Input label="Yeni şifre" value={newPassword} onChange={setNewPassword} type="password" />
        <button
          type="button"
          disabled={passwordMutation.isPending || !currentPassword || !newPassword}
          onClick={() => passwordMutation.mutate()}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] disabled:opacity-50"
        >
          Şifreyi güncelle
        </button>
      </section>

      {feedback ? <p className="mt-6 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--muted)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
      />
    </div>
  );
}
