"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AgentAutoTextarea } from "@/components/agent/agent-auto-textarea";
import { AgentBrandWidget } from "@/components/agent/agent-brand-widget";
import { AgentSuggestionChips } from "@/components/agent/agent-suggestion-chips";
import { AgentThinking } from "@/components/agent/agent-thinking";
import {
  addBuyerFavorite,
  deleteAgentSession,
  getAgentSession,
  postAgentChat,
} from "@/lib/api";
import { sanitizeAgentAnswer } from "@/lib/agent-answer-sanitize";
import { getUserFacingError } from "@/lib/form-errors";
import { AssistantBrand, AssistantSuggestion } from "@/lib/types";
import { useMediaQuery } from "@/hooks/use-media-query";

const SESSION_STORAGE_KEY = "fh-agent-session-id";

const WELCOME_TEXT =
  "Merhaba — filtre formları yerine doğal dilde sorun. Size tıklanabilir marka kartları getireyim.";

const STARTERS: AssistantSuggestion[] = [
  { label: "Bütçeme uygun Marmara fast-food bayilikleri", action: "refine_search" },
  { label: "500 bin TL altı gıda markaları", action: "refine_search" },
  { label: "İstanbul'da kahve franchise fırsatları", action: "refine_search" },
];

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      brands?: AssistantBrand[];
      suggestions?: AssistantSuggestion[];
      intent?: string;
    };

const messageVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

function AgentMessage({
  msg,
  index,
  onSuggestion,
  disabled,
}: {
  msg: ChatMessage;
  index: number;
  onSuggestion: (s: AssistantSuggestion) => void;
  disabled?: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      className={isUser ? "agent-bubble agent-bubble-user" : "agent-bubble agent-bubble-ai"}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.p
        className="agent-bubble-text"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 + 0.06, duration: 0.32 }}
      >
        {msg.text}
      </motion.p>
      {msg.role === "assistant" && msg.brands && msg.brands.length > 0 ? (
        <div className="agent-widget-list">
          {msg.brands.map((brand, i) => (
            <AgentBrandWidget key={brand.id} brand={brand} index={i} />
          ))}
        </div>
      ) : null}
      {msg.role === "assistant" && msg.suggestions && msg.suggestions.length > 0 ? (
        <AgentSuggestionChips
          items={msg.suggestions}
          disabled={disabled}
          onSelect={onSuggestion}
          className="agent-action-chips-inline"
        />
      ) : null}
    </motion.div>
  );
}

function readStoredSessionId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function storeSessionId(id: number | null) {
  if (typeof window === "undefined") return;
  if (id == null) sessionStorage.removeItem(SESSION_STORAGE_KEY);
  else sessionStorage.setItem(SESSION_STORAGE_KEY, String(id));
}

function FranchiseAgentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandFromUrl = Number(searchParams.get("brand"));
  const brandContextId =
    Number.isFinite(brandFromUrl) && brandFromUrl > 0 ? brandFromUrl : undefined;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: WELCOME_TEXT },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  const isMobileSheet = useMediaQuery("(max-width: 767px)");

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const favoriteMutation = useMutation({
    mutationFn: (brandId: number) => addBuyerFavorite(brandId),
  });

  const restoreSession = useCallback(async (id: number) => {
    try {
      const detail = await getAgentSession(id);
      const history = detail.messages ?? [];
      if (history.length === 0) return;

      setSessionId(id);
      setMessages([
        { id: "welcome", role: "assistant", text: WELCOME_TEXT },
        ...history.map((m) => ({
          id: `hist-${m.id}`,
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          text: m.role === "user" ? m.content : sanitizeAgentAnswer(m.content),
        })),
      ]);
    } catch {
      storeSessionId(null);
      setSessionId(null);
    }
  }, []);

  useEffect(() => {
    if (!open || restoredRef.current) return;
    restoredRef.current = true;
    const stored = readStoredSessionId();
    if (stored) void restoreSession(stored);
  }, [open, restoreSession]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const respond = async (text: string, opts?: { newSession?: boolean }) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    scrollDown();

    try {
      const data = await postAgentChat({
        query: text,
        session_id: opts?.newSession ? undefined : sessionId ?? undefined,
        new_session: opts?.newSession ?? false,
        brand_context_id: brandContextId,
      });

      if (data.session_id) {
        setSessionId(data.session_id);
        storeSessionId(data.session_id);
      }

      const reply: ChatMessage = {
        id: `a-${data.message_id ?? Date.now()}`,
        role: "assistant",
        text: sanitizeAgentAnswer(data.answer),
        brands: data.brands,
        suggestions: data.suggestions,
        intent: data.intent,
      };
      setMessages((m) => [...m, reply]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: sanitizeAgentAnswer(
            getUserFacingError(e, "Asistan yanıt veremedi. Lütfen tekrar deneyin."),
          ),
        },
      ]);
    } finally {
      setTyping(false);
      scrollDown();
    }
  };

  const startNewChat = async () => {
    if (sessionId) {
      try {
        await deleteAgentSession(sessionId);
      } catch {
        /* oturum zaten silinmiş olabilir */
      }
    }
    storeSessionId(null);
    setSessionId(null);
    setMessages([{ id: "welcome", role: "assistant", text: WELCOME_TEXT }]);
  };

  const handleSuggestion = async (s: AssistantSuggestion) => {
    if (s.action === "refine_search") {
      respond(s.label);
      return;
    }
    if (s.action === "open_brand" || s.action === "start_application") {
      if (s.brand_id) router.push(`/buyer/discover?brand=${s.brand_id}`);
      return;
    }
    if (s.action === "add_favorite" && s.brand_id) {
      try {
        await favoriteMutation.mutateAsync(s.brand_id);
        setMessages((m) => [
          ...m,
          {
            id: `fav-${Date.now()}`,
            role: "assistant",
            text: "Marka favorilerinize eklendi.",
          },
        ]);
        scrollDown();
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            id: `fav-e-${Date.now()}`,
            role: "assistant",
            text: getUserFacingError(e, "Favoriye eklenemedi."),
          },
        ]);
      }
    }
  };

  const submitInput = () => {
    const text = input.trim();
    if (!text || typing) return;
    respond(text);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitInput();
  };

  const showWelcomeStarters = messages.length <= 1;

  return (
    <>
      <button
        type="button"
        className="agent-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Franchise asistanı"
      >
        {open ? "×" : "AI"}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="agent-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={() => setOpen(false)}
              aria-label="Asistanı kapat"
            />
            <motion.div
              className={`agent-panel agent-panel-dark${isMobileSheet ? " agent-panel-sheet" : ""}`}
              initial={
                isMobileSheet
                  ? { y: "100%" }
                  : { opacity: 0, y: 32, scale: 0.92 }
              }
              animate={isMobileSheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={
                isMobileSheet
                  ? { y: "100%" }
                  : { opacity: 0, y: 20, scale: 0.94 }
              }
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Franchise asistanı"
              onClick={(e) => e.stopPropagation()}
            >
              {isMobileSheet ? <div className="agent-sheet-handle" aria-hidden /> : null}
              <header className="agent-panel-header">
                <div>
                  <p className="agent-panel-eyebrow">Yapay zeka asistanı</p>
                  <h2 className="agent-panel-title">Franchise Asistanı</h2>
                </div>
                <div className="agent-panel-header-actions">
                  <button
                    type="button"
                    className="agent-panel-new-chat"
                    onClick={() => void startNewChat()}
                    aria-label="Yeni sohbet"
                  >
                    Yeni
                  </button>
                  <button type="button" className="agent-panel-close" onClick={() => setOpen(false)} aria-label="Kapat">
                    ×
                  </button>
                </div>
              </header>

              <div ref={listRef} className="agent-panel-messages">
                {messages.map((msg, i) => (
                  <AgentMessage
                    key={msg.id}
                    msg={msg}
                    index={i}
                    onSuggestion={handleSuggestion}
                    disabled={typing}
                  />
                ))}
                {typing ? <AgentThinking /> : null}
              </div>

              {showWelcomeStarters ? (
                <div className="agent-starters">
                  <AgentSuggestionChips
                    items={STARTERS}
                    disabled={typing}
                    onSelect={handleSuggestion}
                  />
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="agent-panel-form">
                <AgentAutoTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onEnterSubmit={submitInput}
                  placeholder="Örn: Marmara'da bütçeme uygun fast-food…"
                  disabled={typing}
                />
                <button type="submit" className="agent-panel-submit btn btn-primary btn-sm" disabled={typing || !input.trim()}>
                  Gönder
                </button>
              </form>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function FranchiseAgent() {
  return (
    <Suspense fallback={null}>
      <FranchiseAgentInner />
    </Suspense>
  );
}
