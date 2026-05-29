"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useRef, useState } from "react";
import { AgentBrandWidget } from "@/components/agent/agent-brand-widget";
import { getBrands } from "@/lib/api";
import {
  BrandSearchFilters,
  describeAgentFilters,
  filterBrandsByAgent,
  parseAgentQuery,
} from "@/lib/agent-query-parser";
import { Brand } from "@/lib/types";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; brands?: Brand[]; filters?: BrandSearchFilters };

const STARTERS = [
  "Bütçeme uygun Marmara fast-food bayilikleri",
  "500 bin TL altı gıda markaları",
  "İstanbul'da kahve franchise fırsatları",
];

export function FranchiseAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Merhaba — filtre formları yerine doğal dilde sorun. Size tıklanabilir marka kartları getireyim.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const respond = async (text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    scrollDown();

    const filters = parseAgentQuery(text);

    try {
      await new Promise((r) => setTimeout(r, 700));
      const all = await getBrands({
        sector: filters.sector,
        location: filters.location,
        q: filters.q,
      });
      const brands = filterBrandsByAgent(all, filters).slice(0, 4);

      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text:
          brands.length > 0
            ? `${describeAgentFilters(filters)} için ${brands.length} fırsat buldum:`
            : `Bu kriterlerle eşleşen marka bulamadım (${describeAgentFilters(filters)}). Farklı bir soru deneyin.`,
        brands: brands.length > 0 ? brands : undefined,
        filters,
      };
      setMessages((m) => [...m, reply]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: `e-${Date.now()}`, role: "assistant", text: "Markalar yüklenirken bir sorun oluştu. Tekrar deneyin." },
      ]);
    } finally {
      setTyping(false);
      scrollDown();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    respond(text);
  };

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
          <motion.div
            className="agent-panel"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Franchise asistanı"
          >
            <header className="agent-panel-header">
              <div>
                <p className="agent-panel-eyebrow">Generative UI</p>
                <h2 className="agent-panel-title">Franchise Asistanı</h2>
              </div>
              <button type="button" className="agent-panel-close" onClick={() => setOpen(false)} aria-label="Kapat">
                ×
              </button>
            </header>

            <div ref={listRef} className="agent-panel-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={msg.role === "user" ? "agent-bubble agent-bubble-user" : "agent-bubble agent-bubble-ai"}>
                  <p>{msg.text}</p>
                  {msg.role === "assistant" && msg.brands ? (
                    <div className="agent-widget-list">
                      {msg.brands.map((brand, i) => (
                        <AgentBrandWidget key={brand.id} brand={brand} index={i} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {typing ? (
                <div className="agent-bubble agent-bubble-ai agent-typing" aria-live="polite">
                  <span />
                  <span />
                  <span />
                </div>
              ) : null}
            </div>

            <div className="agent-starters">
              {STARTERS.map((s) => (
                <button key={s} type="button" className="agent-starter-chip" onClick={() => respond(s)} disabled={typing}>
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="agent-panel-form">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Örn: Marmara'da bütçeme uygun fast-food…"
                className="agent-panel-input"
                disabled={typing}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={typing || !input.trim()}>
                Gönder
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
