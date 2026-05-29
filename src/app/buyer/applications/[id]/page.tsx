"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApplicationTimeline } from "@/components/buyer/application-timeline";
import { StatusPill } from "@/components/ui/simple-blocks";
import { getBuyerApplicationById } from "@/lib/api";
import { APPLICATION_STATUS_LABEL } from "@/lib/routes";

export default function BuyerApplicationDetailPage() {
  const params = useParams();
  const idParam = params.id;
  const applicationId = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  const appQuery = useQuery({
    queryKey: ["buyer-application", applicationId],
    queryFn: () => getBuyerApplicationById(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
    retry: false,
  });

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return <p className="text-[var(--danger)]">Geçersiz başvuru.</p>;
  }

  const app = appQuery.data;

  return (
    <div>
      <Link href="/buyer/applications" className="text-sm text-[var(--primary-hover)] hover:underline">
        ← Başvurularım
      </Link>
      <h2 className="mt-4 page-title">Başvuru #{applicationId}</h2>
      {app ? (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill status={app.status} live={app.status === "pending"} />
            {app.brand_id != null ? (
              <span className="text-sm text-[var(--muted-foreground)]">Marka #{app.brand_id}</span>
            ) : null}
          </div>
          <p className="mt-1 page-desc">{APPLICATION_STATUS_LABEL[app.status] ?? app.status}</p>
        </>
      ) : appQuery.isError ? (
        <p className="mt-2 text-[var(--danger)]">Başvuru detayı yüklenemedi.</p>
      ) : null}

      {app ? (
        <div className="mt-6 card p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Süreç takibi</h3>
          <ApplicationTimeline status={app.status} createdAt={app.created_at} />
        </div>
      ) : null}

      {app?.status === "approved" ? (
        <div className="mt-6 card-muted p-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Marka sahibiyle yazışmak için mesajlar kutusuna gidin.
          </p>
          <Link href={`/buyer/messages/${applicationId}`} className="btn btn-primary btn-sm mt-3">
            Mesajlaşmaya git
          </Link>
        </div>
      ) : null}
    </div>
  );
}
