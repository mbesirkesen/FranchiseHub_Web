"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { globalSearch } from "@/lib/api";
import { getUserRole } from "@/lib/auth";
import { APPLICATION_STATUS_LABEL, getRoleRoute } from "@/lib/routes";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const role = getUserRole();

  const searchQuery = useQuery({
    queryKey: ["global-search", q],
    queryFn: () => globalSearch(q),
    enabled: q.trim().length > 0,
    retry: false,
  });

  const results = searchQuery.data;

  return (
    <div className="glass-card mx-auto max-w-3xl rounded-3xl p-7">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Arama</h1>
        {role ? (
          <Link href={getRoleRoute(role)} className="text-sm text-[var(--primary-hover)]">
            Panele dön
          </Link>
        ) : null}
      </div>
      <p className="page-desc">
        Sorgu: <span className="text-[var(--foreground)]">{q || "—"}</span>
      </p>
      {searchQuery.isError ? (
        <p className="mt-4 text-[var(--danger)]">Arama yapılamadı.</p>
      ) : null}
      {searchQuery.isLoading ? <p className="mt-6 text-[var(--muted)]">Aranıyor…</p> : null}

      {results ? (
        <div className="mt-8 space-y-8">
          <Section title="Markalar" empty={results.brands.length === 0}>
            {results.brands.map((b) => (
              <ResultRow key={b.id} primary={b.name} secondary={`#${b.id} · ${b.sector ?? "—"}`} />
            ))}
          </Section>
          <Section title="Başvurular" empty={results.applications.length === 0}>
            {results.applications.map((a) => (
              <ResultRow
                key={a.id}
                primary={`Başvuru #${a.id}`}
                secondary={APPLICATION_STATUS_LABEL[a.status] ?? a.status}
              />
            ))}
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
      {empty ? <p className="mt-2 text-xs text-[var(--muted)]">Sonuç yok.</p> : <ul className="mt-2 space-y-2">{children}</ul>}
    </div>
  );
}

function ResultRow({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <li className="rounded-lg bg-[var(--border)] border bg-[var(--bg-subtle)] px-3 py-2">
      <p className="text-sm font-medium text-[var(--foreground)]">{primary}</p>
      <p className="text-xs text-[var(--muted)]">{secondary}</p>
    </li>
  );
}

export default function SearchPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen px-4 py-10">
        <Suspense fallback={<p className="text-center text-[var(--muted)]">Yükleniyor…</p>}>
          <SearchContent />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
