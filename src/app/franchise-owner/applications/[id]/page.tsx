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
    return <p className="text-sm text-red-400">Geçersiz başvuru.</p>;
  }

  const messages = messagesQuery.data ?? [];

  return (
    <div>
      <Link
        href="/franchise-owner/applications"
        className="text-sm font-medium text-cyan-300/90 hover:text-cyan-200"
      >
        ← Başvurulara dön
      </Link>

      <h2 className="mt-4 text-lg font-semibold text-slate-50">Başvuru #{applicationId}</h2>
      {applicationQuery.isLoading ? (
        <p className="mt-2 text-sm text-slate-400">Başvuru bilgisi yükleniyor…</p>
      ) : null}
      {application ? (
        <p className="mt-2 text-sm text-slate-400">
          Durum: <span className="font-medium text-slate-100">{application.status}</span>
          {application.notes ? ` · ${application.notes}` : null}
        </p>
      ) : !applicationQuery.isLoading ? (
        <p className="mt-2 text-sm text-amber-400/90">
          Bu başvuru listede yok veya erişim yok; yine de mesaj uçları denenebilir.
        </p>
      ) : null}

      <div className="mt-6 rounded-xl border border-slate-500/25 bg-slate-950/35 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-50">Mesajlar</h3>
        {messagesQuery.isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Mesajlar yükleniyor…</p>
        ) : null}
        {messagesQuery.isError ? (
          <p className="mt-3 text-sm text-red-400">Mesajlar alınamadı.</p>
        ) : null}
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {messages.map((m, idx) => (
            <li
              key={m.id ?? idx}
              className="rounded-lg border border-slate-500/25 bg-slate-950/50 px-3 py-2 text-sm text-slate-200"
            >
              <p>{m.content}</p>
              <p className="mt-1 text-xs text-slate-500">
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
          <p className="mt-3 text-sm text-slate-400">Henüz mesaj yok.</p>
        ) : null}

        <div className="mt-4 border-t border-slate-500/20 pt-4">
          <label className="text-xs font-medium text-slate-300">Yeni mesaj</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-500/40 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            placeholder="Adaya not yazın…"
          />
          <button
            type="button"
            disabled={sendMutation.isPending || !content.trim()}
            onClick={() => sendMutation.mutate()}
            className="mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
          >
            {sendMutation.isPending ? "Gönderiliyor…" : "Gönder"}
          </button>
        </div>
      </div>

      {feedback ? (
        <p className="mt-4 rounded-xl border border-slate-500/30 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
