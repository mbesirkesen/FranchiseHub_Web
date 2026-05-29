"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusPill } from "@/components/ui/simple-blocks";
import { getMyBrandApplications } from "@/lib/api";
import { APPLICATION_STATUS_LABEL } from "@/lib/routes";

export default function FranchiseApplicationDetailPage() {
  const params = useParams();
  const idParam = params.id;
  const applicationId = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  const applicationQuery = useQuery({
    queryKey: ["franchise-applications"],
    queryFn: () => getMyBrandApplications(),
  });

  const application = (applicationQuery.data ?? []).find((a) => a.id === applicationId);

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return <p className="text-[var(--danger)]">Geçersiz başvuru.</p>;
  }

  return (
    <div>
      <Link
        href="/franchise-owner/applications"
        className="text-sm font-medium text-[var(--primary-hover)] hover:underline"
      >
        ← Başvurulara dön
      </Link>

      <h2 className="mt-4 page-title">Başvuru #{applicationId}</h2>
      {applicationQuery.isLoading ? (
        <p className="page-desc">Başvuru bilgisi yükleniyor…</p>
      ) : null}
      {application ? (
        <>
          <div className="mt-2">
            <StatusPill status={application.status} />
          </div>
          <p className="mt-1 page-desc">
            {APPLICATION_STATUS_LABEL[application.status] ?? application.status}
            {application.notes ? ` · ${application.notes}` : null}
          </p>
        </>
      ) : !applicationQuery.isLoading ? (
        <p className="mt-2 text-sm text-amber-600">Bu başvuru listede yok veya erişim yok.</p>
      ) : null}

      {application?.status === "approved" ? (
        <div className="mt-6 card-muted p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Adayla yazışmak için mesajlar kutusuna gidin.</p>
          <Link href={`/franchise-owner/messages/${applicationId}`} className="btn btn-primary btn-sm mt-3">
            Mesajlaşmaya git
          </Link>
        </div>
      ) : null}
    </div>
  );
}
