"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApplicationMessagesPanel } from "@/components/messages/application-messages-panel";
import { getBuyerApplicationById, getConversations, getMyBrandApplications } from "@/lib/api";
import { getApplicationBrandName, getApplicationBuyerName } from "@/lib/application-display";

type Props = {
  viewer: "buyer" | "franchise_owner";
  inboxPath: string;
  /** Örn. /buyer/applications — id client tarafında eklenir */
  applicationDetailBasePath: string;
};

export function MessageThreadPage({ viewer, inboxPath, applicationDetailBasePath }: Props) {
  const params = useParams();
  const idParam = params.applicationId;
  const applicationId = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
  });

  const conv = (conversationsQuery.data ?? []).find((c) => c.application_id === applicationId);

  const buyerAppQuery = useQuery({
    queryKey: ["buyer-application", applicationId],
    queryFn: () => getBuyerApplicationById(applicationId),
    enabled: viewer === "buyer" && Number.isFinite(applicationId) && applicationId > 0,
    retry: false,
  });

  const foAppsQuery = useQuery({
    queryKey: ["franchise-applications"],
    queryFn: () => getMyBrandApplications(),
    enabled: viewer === "franchise_owner",
  });

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return <p className="text-[var(--danger)]">Geçersiz konuşma.</p>;
  }

  const applicationStatus =
    viewer === "buyer"
      ? buyerAppQuery.data?.status ?? conv?.application_status
      : (foAppsQuery.data ?? []).find((a) => a.id === applicationId)?.status ?? conv?.application_status;

  const buyerApp = buyerAppQuery.data;
  const foApp = (foAppsQuery.data ?? []).find((a) => a.id === applicationId);

  const threadTitle =
    viewer === "buyer"
      ? getApplicationBrandName(
          buyerApp ?? { id: applicationId, brand_id: conv?.brand_id },
          conv,
        )
      : getApplicationBuyerName(foApp ?? {}, conv) ?? "Aday";

  return (
    <div>
      <Link href={inboxPath} className="text-sm text-[var(--primary-hover)] hover:underline">
        ← Mesajlar
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="page-title">{threadTitle}</h2>
          <p className="page-desc">
            {viewer === "franchise_owner" && conv?.brand_name ? conv.brand_name : "Onaylı başvuru"}
          </p>
        </div>
        <Link href={`${applicationDetailBasePath}/${applicationId}`} className="btn btn-secondary btn-sm">
          Başvuru detayı
        </Link>
      </div>

      <ApplicationMessagesPanel
        applicationId={applicationId}
        applicationStatus={applicationStatus}
        viewer={viewer}
        variant="thread"
      />
    </div>
  );
}
