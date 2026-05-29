"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { createMessage, getMessages, getMyBrandApplications } from "@/lib/api";

export default function FranchiseApplicationMessagesPage() {
  const params = useParams();
  const idParam = params.id;
  const applicationId = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const applicationQuery = useQuery({
    queryKey: ["franchise-applications"],
    queryFn: () => getMyBrandApplications(),
  });

  const application = (applicationQuery.data ?? []).find((a) => a.id === applicationId);

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
    onError: () => {
      setFeedback("Mesaj gönderilemedi.");
    },
  });

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return <p className="text-[var(--danger)]">Geçersiz başvuru.</p>;
  }

  const messages = messagesQuery.data ?? [];

  return (
    <div>
      <Link
        href="/franchise-owner/applications"
        className="text-sm font-medium text-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
      >
        ← Başvurulara dön
      </Link>

      <h2 className="mt-4 page-title">Başvuru #{applicationId}</h2>
      {applicationQuery.isLoading ? (
        <p className="page-desc">Başvuru bilgisi yükleniyor…</p>
      ) : null}
      {application ? (
        <p className="page-desc">
          Durum: <span className="font-medium text-[var(--foreground)]">{application.status}</span>
          {application.notes ? ` · ${application.notes}` : null}
        </p>
      ) : !applicationQuery.isLoading ? (
        <p className="mt-2 text-sm text-amber-400/90">
          Bu başvuru listede yok veya erişim yok.
        </p>
      ) : null}

      <div className="mt-6 card-muted p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Mesajlar</h3>
        {messagesQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Mesajlar yükleniyor…</p>
        ) : null}
        {messagesQuery.isError ? (
          <p className="mt-3 text-[var(--danger)]">Mesajlar alınamadı.</p>
        ) : null}
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {messages.map((m, idx) => (
            <li
              key={m.id ?? idx}
              className="rounded-lg bg-[var(--border)] border bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <p>{m.content}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {m.is_from_buyer === true
                  ? "Alıcı"
                  : m.sender_role
                    ? m.sender_role
                    : "Siz / marka"}
                {m.created_at ? ` · ${m.created_at}` : ""}
              </p>
            </li>
          ))}
        </ul>
        {messages.length === 0 && !messagesQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Henüz mesaj yok.</p>
        ) : null}

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Yeni mesaj</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="mt-1 w-full input"
            placeholder="Adaya not yazın…"
          />
          <button
            type="button"
            disabled={sendMutation.isPending || !content.trim()}
            onClick={() => sendMutation.mutate()}
            className="mt-2 rounded-xl btn btn-primary btn-sm disabled:opacity-50"
          >
            {sendMutation.isPending ? "Gönderiliyor…" : "Gönder"}
          </button>
        </div>
      </div>

      {feedback ? (
        <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--foreground)]">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
