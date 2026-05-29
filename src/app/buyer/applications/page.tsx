"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState, FriendlyHeader, StatusPill } from "@/components/ui/simple-blocks";
import { getBuyerApplications } from "@/lib/api";
import { APPLICATION_STATUS_HINT } from "@/lib/routes";

export default function BuyerApplicationsPage() {
  const appsQuery = useQuery({
    queryKey: ["buyer-applications"],
    queryFn: () => getBuyerApplications(),
    retry: false,
  });

  const apps = appsQuery.data ?? [];

  return (
    <div>
      <FriendlyHeader
        title="Başvurum"
        subtitle="Gönderdiğiniz talepler ve markayla yazışmalar."
      />

      {appsQuery.isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p> : null}
      {appsQuery.isError ? <p className="alert alert-error">Başvurular yüklenemedi.</p> : null}

      <ul className="space-y-3">
        {apps.map((app) => (
          <li key={app.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">Başvuru #{app.id}</p>
                <div className="mt-2">
                  <StatusPill status={app.status} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {APPLICATION_STATUS_HINT[app.status] ?? ""}
                </p>
                {app.created_at ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{app.created_at}</p>
                ) : null}
              </div>
              <Link href={`/buyer/applications/${app.id}`} className="btn btn-primary btn-sm">
                Mesajlar
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {!appsQuery.isLoading && !appsQuery.isError && apps.length === 0 ? (
        <EmptyState
          icon="📄"
          title="Henüz başvuru yok"
          description="Beğendiğiniz bir markaya başvurun — durumu buradan takip edersiniz."
          action={
            <Link href="/buyer/discover" className="btn btn-primary">
              Marka bul
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
