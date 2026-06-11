"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState, FriendlyHeader } from "@/components/ui/simple-blocks";
import { getConversations } from "@/lib/api";
import { formatMessagePreview, formatMessageTime } from "@/lib/message-utils";

type Props = {
  viewer: "buyer" | "franchise_owner";
  threadBasePath: string;
};

export function ConversationsInbox({ viewer, threadBasePath }: Props) {
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    refetchInterval: 30_000,
  });

  const conversations = conversationsQuery.data ?? [];
  const totalUnread = conversations.reduce((n, c) => n + (c.unread_count ?? 0), 0);

  return (
    <div>
      <FriendlyHeader
        title="Mesajlar"
        subtitle={
          viewer === "buyer"
            ? "Onaylı başvurularınızda marka sahipleriyle yazışın."
            : "Onayladığınız adaylarla yazışın."
        }
      />

      {totalUnread > 0 ? (
        <p className="mb-4 text-sm text-[var(--primary)]">{totalUnread} okunmamış mesaj</p>
      ) : null}

      {conversationsQuery.isLoading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Konuşmalar yükleniyor…</p>
      ) : null}
      {conversationsQuery.isError ? (
        <p className="alert alert-error">Konuşmalar yüklenemedi.</p>
      ) : null}

      {conversations.length > 0 ? (
        <ul className="space-y-2">
          {conversations.map((conv) => {
            const title = viewer === "buyer" ? conv.brand_name : conv.buyer_name;
            const unread = conv.unread_count ?? 0;

            return (
              <li key={conv.application_id}>
                <Link
                  href={`${threadBasePath}/${conv.application_id}`}
                  className={`conversation-row${unread > 0 ? " conversation-row-unread" : ""}`}
                >
                  <span className="conversation-row-avatar" aria-hidden>
                    {title.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="conversation-row-head">
                      <span className="conversation-row-title">{title}</span>
                      {conv.last_message?.created_at ? (
                        <span className="conversation-row-time">
                          {formatMessageTime(conv.last_message.created_at)}
                        </span>
                      ) : null}
                    </span>
                    <span className="conversation-row-preview">
                      {conv.last_message
                        ? formatMessagePreview(conv.last_message.content)
                        : "Henüz mesaj yok — sohbeti başlatın"}
                    </span>
                    <span className="conversation-row-meta">
                      {viewer === "franchise_owner" ? conv.brand_name : conv.application_status === "approved" ? "Onaylı bayilik" : ""}
                    </span>
                  </span>
                  {unread > 0 ? <span className="conversation-row-badge">{unread}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!conversationsQuery.isLoading && !conversationsQuery.isError && conversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Henüz mesaj yok"
          description={
            viewer === "buyer"
              ? "Başvurunuz onaylandığında marka sahibiyle buradan yazışabilirsiniz."
              : "Bir başvuruyu onayladığınızda adayla buradan yazışabilirsiniz."
          }
          action={
            viewer === "buyer" ? (
              <Link href="/buyer/applications" className="btn btn-primary">
                Başvurularım
              </Link>
            ) : (
              <Link href="/franchise-owner/applications" className="btn btn-primary">
                Başvurular
              </Link>
            )
          }
        />
      ) : null}
    </div>
  );
}
