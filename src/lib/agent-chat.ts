import axios from "axios";
import {
  deleteAgentSession,
  deleteFoAgentSession,
  getAgentSession,
  getAgentSessions,
  getFoAgentSession,
  getFoAgentSessions,
  postAgentChat,
  postFoAgentChat,
} from "@/lib/api";
import { parseCompareResult } from "@/lib/compare-utils";
import { AssistantChatRequest, AssistantQueryResponse, UserRole } from "@/lib/types";

export type AgentChatRole = Extract<UserRole, "buyer" | "franchise_owner">;

export const AGENT_SESSION_STORAGE_KEY: Record<AgentChatRole, string> = {
  buyer: "fh-agent-session-id",
  franchise_owner: "fh-fo-agent-session-id",
};

const AGENT_CHAT_PATH: Record<AgentChatRole, string> = {
  buyer: "/agent/chat",
  franchise_owner: "/agent/fo/chat",
};

export function agentChatPath(role: AgentChatRole): string {
  return AGENT_CHAT_PATH[role];
}

export function buildAgentChatPayload(
  role: AgentChatRole,
  text: string,
  opts?: { sessionId?: number | null; newSession?: boolean; brandContextId?: number },
): AssistantChatRequest {
  const payload: AssistantChatRequest = {
    query: text.trim(),
    session_id: opts?.newSession ? undefined : opts?.sessionId ?? undefined,
    new_session: opts?.newSession ?? false,
  };
  if (role === "buyer" && opts?.brandContextId) {
    payload.brand_context_id = opts.brandContextId;
  }
  return payload;
}

export function postAgentChatForRole(role: AgentChatRole, payload: AssistantChatRequest) {
  return role === "franchise_owner" ? postFoAgentChat(payload) : postAgentChat(payload);
}

export function getAgentSessionsForRole(role: AgentChatRole) {
  return role === "franchise_owner" ? getFoAgentSessions() : getAgentSessions();
}

export function getAgentSessionForRole(role: AgentChatRole, sessionId: number) {
  return role === "franchise_owner" ? getFoAgentSession(sessionId) : getAgentSession(sessionId);
}

export function deleteAgentSessionForRole(role: AgentChatRole, sessionId: number) {
  return role === "franchise_owner" ? deleteFoAgentSession(sessionId) : deleteAgentSession(sessionId);
}

export function readStoredAgentSessionId(role: AgentChatRole): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AGENT_SESSION_STORAGE_KEY[role]);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function storeAgentSessionId(role: AgentChatRole, id: number | null) {
  if (typeof window === "undefined") return;
  const key = AGENT_SESSION_STORAGE_KEY[role];
  if (id == null) sessionStorage.removeItem(key);
  else sessionStorage.setItem(key, String(id));
}

/** Asistan API hataları — 429 / 404 / 422 */
export function getAgentChatErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    if (status === 429) {
      return "Çok fazla mesaj gönderdiniz. Lütfen bir dakika bekleyip tekrar deneyin.";
    }
    if (status === 404) {
      return "Sohbet oturumu bulunamadı. Yeni sohbet başlatılıyor — tekrar yazabilirsiniz.";
    }
    if (status === 422) {
      if (typeof detail === "string" && detail.includes("2 karakter")) {
        return "Mesaj en az 2 karakter olmalı.";
      }
      return "Mesaj gönderilemedi — metni kontrol edin.";
    }
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }
  return "Asistan yanıt veremedi. Lütfen tekrar deneyin.";
}

export function isAgentSessionNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export type AgentUiConfig = {
  welcomeText: string;
  panelTitle: string;
  placeholder: string;
  starters: Array<{ label: string; action: string }>;
  showBrandWidgets: boolean;
};

export const AGENT_UI: Record<AgentChatRole, AgentUiConfig> = {
  buyer: {
    welcomeText:
      "Merhaba — filtre formları yerine doğal dilde sorun. Size tıklanabilir marka kartları getireyim.",
    panelTitle: "Franchise Asistanı",
    placeholder: "Örn: Marmara'da bütçeme uygun fast-food…",
    starters: [
      { label: "Bütçeme uygun Marmara fast-food bayilikleri", action: "refine_search" },
      { label: "500 bin TL altı gıda markaları", action: "refine_search" },
      { label: "İstanbul'da kahve franchise fırsatları", action: "refine_search" },
    ],
    showBrandWidgets: true,
  },
  franchise_owner: {
    welcomeText:
      "Merhaba — stok, tedarik talepleri, başvurular ve panel özetiniz hakkında sorabilirsiniz.",
    panelTitle: "Marka Asistanı",
    placeholder: "Örn: düşük stoklar, bekleyen bayi talepleri…",
    starters: [
      { label: "Düşük stoklar neler?", action: "refine_search" },
      { label: "Bekleyen bayi tedarik talepleri", action: "refine_search" },
      { label: "Kaç başvuru bekliyor?", action: "refine_search" },
    ],
    showBrandWidgets: false,
  },
};

export function mapAgentResponseToUi(
  data: AssistantQueryResponse,
  showBrandWidgets: boolean,
): {
  answer: string;
  brands?: AssistantQueryResponse["brands"];
  suggestions?: AssistantQueryResponse["suggestions"];
  intent?: string;
  compareRows?: Array<Record<string, string | number | null>>;
  session_id?: number | null;
  message_id?: number | null;
} {
  return {
    answer: data.answer,
    brands: showBrandWidgets && data.brands?.length ? data.brands : undefined,
    suggestions: data.suggestions,
    intent: data.intent,
    compareRows:
      showBrandWidgets && data.compare ? parseCompareResult(data.compare) : undefined,
    session_id: data.session_id,
    message_id: data.message_id,
  };
}
