"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ApplicationTimeline } from "@/components/buyer/application-timeline";
import { createMessage, getBuyerApplicationById, getMessages } from "@/lib/api";
import { APPLICATION_STATUS_LABEL } from "@/lib/routes";

export default function BuyerApplicationDetailPage() {
  const params = useParams();
  const idParam = params.id;
  const applicationId = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const appQuery = useQuery({
    queryKey: ["buyer-application", applicationId],
    queryFn: () => getBuyerApplicationById(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
    retry: false,
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", applicationId],
    queryFn: () => getMessages(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
  });

  const sendMutation = useMutation({
    mutationFn: () => createMessage({ application_id: applicationId, content: content.trim() }),
    onSuccess: () => {
      setContent("");
      setFeedback("Mesaj gönderildi.");
      queryClient.invalidateQueries({ queryKey: ["messages", applicationId] });
    },
    onError: () => setFeedback("Mesaj gönderilemedi."),
  });

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return <p className="text-[var(--danger)]">Geçersiz başvuru.</p>;
  }

  const messages = messagesQuery.data ?? [];
  const app = appQuery.data;

  return (
    <div>
      <Link href="/buyer/applications" className="text-sm text-[var(--primary-hover)] hover:underline">
        ← Başvurularım
      </Link>
      <h2 className="mt-4 page-title">Başvuru #{applicationId}</h2>
      {app ? (
        <p className="page-desc">
          Durum: {APPLICATION_STATUS_LABEL[app.status] ?? app.status}
          {app.brand_id != null ? ` · Marka #${app.brand_id}` : ""}
        </p>
      ) : appQuery.isError ? (
        <p className="mt-2 text-[var(--danger)]">Başvuru detayı yüklenemedi.</p>
      ) : null}

      {app ? (
        <div className="mt-6 card p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Süreç takibi</h3>
          <ApplicationTimeline status={app.status} createdAt={app.created_at} />
        </div>
      ) : null}

      <div className="mt-6 card-muted p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Mesajlar</h3>
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {messages.map((m, idx) => (
            <li key={m.id ?? idx} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
              <p>{m.content}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {m.is_from_buyer ? "Siz" : m.sender_role ?? "Marka"}
                {m.created_at ? ` · ${m.created_at}` : ""}
              </p>
            </li>
          ))}
        </ul>
        {messages.length === 0 && !messagesQuery.isLoading ? (
          <p className="page-desc">Henüz mesaj yok.</p>
        ) : null}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-4 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
          placeholder="Mesajınız…"
        />
        <button
          type="button"
          disabled={sendMutation.isPending || !content.trim()}
          onClick={() => sendMutation.mutate()}
          className="mt-2 rounded-xl btn btn-primary btn-sm disabled:opacity-50"
        >
          Gönder
        </button>
      </div>
      {feedback ? <p className="mt-4 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
    </div>
  );
}
