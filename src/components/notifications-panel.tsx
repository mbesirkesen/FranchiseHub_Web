"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NotificationsPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    refetchInterval: 60_000,
  });

  const items = notificationsQuery.data ?? [];
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const markRead = async (id: number) => {
    await markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const openNotification = async (id: number, link?: string | null, isRead?: boolean) => {
    if (!isRead) await markRead(id);
    setOpen(false);
    if (link) router.push(link);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="notify-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `${unread} okunmamış bildirim` : "Bildirimler"}
      >
        <BellIcon className="h-[1.125rem] w-[1.125rem]" />
        {unread > 0 ? (
          <span className="notify-badge">{unread > 9 ? "9+" : unread}</span>
        ) : null}
      </button>

      {open ? (
        <div className="notify-dropdown animate-pop-in" role="dialog" aria-label="Bildirimler">
          <div className="notify-dropdown-head">
            <p className="notify-dropdown-title">Bildirimler</p>
            {items.length > 0 ? (
              <button type="button" onClick={markAll} className="notify-mark-all">
                Tümünü okundu say
              </button>
            ) : null}
          </div>

          {notificationsQuery.isLoading ? (
            <p className="notify-empty">Yükleniyor…</p>
          ) : null}
          {notificationsQuery.isError ? (
            <p className="notify-empty notify-empty-error">Bildirimler yüklenemedi.</p>
          ) : null}

          {!notificationsQuery.isLoading && !notificationsQuery.isError ? (
            <ul className="notify-list">
              {items.length === 0 ? (
                <li className="notify-empty">Henüz bildirim yok ✨</li>
              ) : (
                items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(n.id, n.link, n.read)}
                      className={n.read ? "notify-item notify-item-read" : "notify-item"}
                    >
                      <span className="notify-item-dot" aria-hidden />
                      <span className="min-w-0 text-left">
                        <span className="notify-item-title">{n.title ?? "Bildirim"}</span>
                        {n.body ? <span className="notify-item-body">{n.body}</span> : null}
                        {n.created_at ? <span className="notify-item-time">{n.created_at}</span> : null}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
