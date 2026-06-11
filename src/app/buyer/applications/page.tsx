"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState, FriendlyHeader, StatusPill } from "@/components/ui/simple-blocks";
import { getBuyerApplications, getConversations } from "@/lib/api";
import { APPLICATION_STATUS_HINT } from "@/lib/routes";
import { applicationListTitle, formatApplicationDate, getApplicationBrandName } from "@/lib/application-display";

export default function BuyerApplicationsPage() {
  const appsQuery = useQuery({
    queryKey: ["buyer-applications"],
    queryFn: () => getBuyerApplications(),
    retry: false,
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    retry: false,
  });

  const apps = appsQuery.data ?? [];
  const conversationByAppId = new Map(
    (conversationsQuery.data ?? []).map((c) => [c.application_id, c]),
  );

  return (
    <div>
      <FriendlyHeader
        title="Başvurum"
        subtitle="Gönderdiğiniz talepler ve onay sonrası markayla yazışmalar."
      />

      {appsQuery.isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor…</p> : null}
      {appsQuery.isError ? <p className="alert alert-error">Başvurular yüklenemedi.</p> : null}

      <ul className="space-y-3">
        {apps.map((app) => {
          const conv = conversationByAppId.get(app.id);
          const canMessage = app.status === "approved";

          return (
            <li key={app.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{applicationListTitle(app, conv)}</p>
                  <div className="mt-2">
                    <StatusPill status={app.status} live={app.status === "pending"} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {APPLICATION_STATUS_HINT[app.status] ?? ""}
                  </p>
                  {conv?.last_message ? (
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)]">
                      Son mesaj: {conv.last_message.content}
                    </p>
                  ) : null}
                  {app.created_at ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">{formatApplicationDate(app.created_at)}</p>
                  ) : null}
                </div>
                <Link
                  href={
                    canMessage
                      ? `/buyer/messages/${app.id}`
                      : `/buyer/applications/${app.id}`
                  }
                  className={`btn btn-sm ${canMessage ? "btn-primary" : "btn-secondary"}`}
                >
                  {canMessage ? (
                    <>
                      Mesajlar
                      {(conv?.unread_count ?? 0) > 0 ? ` (${conv!.unread_count})` : ""}
                    </>
                  ) : (
                    "Detay"
                  )}
                </Link>
              </div>
            </li>
          );
        })}
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
