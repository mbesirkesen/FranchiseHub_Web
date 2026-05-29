"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HelpBox } from "@/components/ui/simple-blocks";
import {
  createMessage,
  getMessages,
  markApplicationMessagesRead,
} from "@/lib/api";
import { getUserFacingError } from "@/lib/form-errors";
import { formatMessageTime } from "@/lib/message-utils";
import { APPLICATION_STATUS_HINT } from "@/lib/routes";
import { ApplicationStatus } from "@/lib/types";

type Props = {
  applicationId: number;
  applicationStatus?: ApplicationStatus;
  viewer: "buyer" | "franchise_owner";
  variant?: "embedded" | "thread";
};

function senderLabel(viewer: Props["viewer"], isFromBuyer?: boolean, senderRole?: string): string {
  if (viewer === "buyer") {
    return isFromBuyer ? "Siz" : senderRole === "franchise_owner" ? "Marka" : "Marka";
  }
  return isFromBuyer ? "Alıcı" : "Siz";
}

export function ApplicationMessagesPanel({
  applicationId,
  applicationStatus,
  viewer,
  variant = "embedded",
}: Props) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const messagingEnabled = applicationStatus === "approved";

  const messagesQuery = useQuery({
    queryKey: ["messages", applicationId],
    queryFn: () => getMessages(applicationId),
    enabled: messagingEnabled && Number.isFinite(applicationId) && applicationId > 0,
  });

  useEffect(() => {
    if (!messagingEnabled || !messagesQuery.isSuccess) return;
    void markApplicationMessagesRead(applicationId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [applicationId, messagingEnabled, messagesQuery.isSuccess, queryClient]);

  const sendMutation = useMutation({
    mutationFn: () => createMessage({ application_id: applicationId, content: content.trim() }),
    onSuccess: () => {
      setContent("");
      setFeedback("Mesaj gönderildi.");
      queryClient.invalidateQueries({ queryKey: ["messages", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e) => {
      setFeedback(
        getUserFacingError(e, "Mesaj gönderilemedi. Başvurunun onaylı olduğundan emin olun."),
      );
    },
  });

  if (!messagingEnabled) {
    const hint =
      applicationStatus != null
        ? (APPLICATION_STATUS_HINT[applicationStatus] ?? "Mesajlaşma henüz açık değil.")
        : "Başvuru durumu yüklenene kadar mesajlaşma kapalı.";

    return (
      <div className="mt-6 card-muted p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Mesajlar</h3>
        <div className="mt-3">
          <HelpBox>
            Mesajlaşma yalnızca <strong>onaylanmış</strong> başvurularda açılır. {hint}
          </HelpBox>
        </div>
      </div>
    );
  }

  const messages = messagesQuery.data ?? [];
  const listClass = variant === "thread" ? "message-thread-list" : "max-h-80";

  return (
    <div className={variant === "thread" ? "mt-6 message-thread-panel" : "mt-6 card-muted p-4"}>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Mesajlar</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {viewer === "buyer" ? "Marka sahibi ile yazışın." : "Onaylı aday ile yazışın."}
      </p>

      {messagesQuery.isLoading ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">Mesajlar yükleniyor…</p>
      ) : null}
      {messagesQuery.isError ? (
        <p className="mt-3 alert alert-error">
          {getUserFacingError(messagesQuery.error, "Mesajlar alınamadı.")}
        </p>
      ) : null}

      <ul className={`mt-3 space-y-2 overflow-y-auto ${listClass}`}>
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm${
              m.is_read === false ? " border-l-2 border-l-[var(--primary)]" : ""
            }`}
          >
            <p>{m.content}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {senderLabel(viewer, m.is_from_buyer, m.sender_role)}
              {m.created_at ? ` · ${formatMessageTime(m.created_at)}` : ""}
            </p>
          </li>
        ))}
      </ul>

      {messages.length === 0 && !messagesQuery.isLoading && !messagesQuery.isError ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">Henüz mesaj yok — ilk mesajı siz gönderin.</p>
      ) : null}

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <label className="text-xs font-medium text-[var(--muted-foreground)]">Yeni mesaj</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-1 w-full textarea"
          placeholder={viewer === "buyer" ? "Marka sahibine mesajınız…" : "Adaya not yazın…"}
        />
        <button
          type="button"
          disabled={sendMutation.isPending || !content.trim()}
          onClick={() => sendMutation.mutate()}
          className="mt-2 btn btn-primary btn-sm disabled:opacity-50"
        >
          {sendMutation.isPending ? "Gönderiliyor…" : "Gönder"}
        </button>
      </div>

      {feedback ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
    </div>
  );
}
