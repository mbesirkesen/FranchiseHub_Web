import axios from "axios";
import { parseCompareResult } from "@/lib/compare-utils";
import { clearSession, getAccessToken } from "@/lib/auth";
import { parseFranchiseDashboardSummary } from "@/lib/dashboard-summary";
import { normalizeList } from "@/lib/list-utils";
import { normalizeUserProfile } from "@/lib/user-profile";
import {
  Application,
  ApplicationCreateRequest,
  ApplicationUpdateRequest,
  AgentSession,
  AgentSessionDetail,
  AssistantChatRequest,
  AssistantQueryResponse,
  Brand,
  BrandCompareRequest,
  BrandCreateRequest,
  BrandFdd,
  BrandMedia,
  BrandUpdateRequest,
  BuyerDashboardSummary,
  BuyerQualificationRequest,
  BuyerRegisterRequest,
  BuyerSupplyRequestCreate,
  ChangePasswordRequest,
  ConversationItem,
  ConversationSummary,
  ForgotPasswordRequest,
  FranchiseAnalytics,
  FranchiseDashboardSummary,
  FranchiseDocument,
  FranchiseOwnerRegisterRequest,
  InventoryItem,
  InventoryTransferRequest,
  LoginRequest,
  LoginResponse,
  Message,
  MessageCreateRequest,
  Notification,
  Outlet,
  OutletCreateRequest,
  ProfileUpdateRequest,
  ResetPasswordRequest,
  SearchResults,
  SupplyBulkRequest,
  SupplyPoolItem,
  SupplyRequest,
  SupplyRequestUpdateRequest,
  Territory,
  UserProfile,
} from "@/lib/types";

const baseURL = "/api/proxy";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
    const isAuthFlow =
      url.includes("/auth/login") ||
      url.includes("/auth/register/") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");
    if (typeof window !== "undefined" && !isAuthFlow && getAccessToken()) {
      clearSession();
      window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export async function login(payload: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function registerBuyer(payload: BuyerRegisterRequest) {
  const response = await api.post("/auth/register/buyer", payload);
  return response.data;
}

export async function registerFranchiseOwner(payload: FranchiseOwnerRegisterRequest) {
  const response = await api.post("/auth/register/franchise-owner", payload);
  return response.data;
}

export async function getMe(): Promise<UserProfile> {
  const response = await api.get<unknown>("/auth/me");
  return normalizeUserProfile(response.data);
}

export async function updateMe(payload: ProfileUpdateRequest) {
  const response = await api.patch<unknown>("/auth/me", payload);
  return normalizeUserProfile(response.data);
}

export async function changePassword(payload: ChangePasswordRequest) {
  const response = await api.post("/auth/change-password", payload);
  return response.data;
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  const response = await api.post("/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(payload: ResetPasswordRequest) {
  const response = await api.post("/auth/reset-password", payload);
  return response.data;
}

export type GetBrandsParams = {
  sector?: string;
  min_cost?: number;
  max_cost?: number;
  location?: string;
  q?: string;
  page?: number;
  page_size?: number;
  sort?: string;
};

export async function getBrands(params?: GetBrandsParams) {
  const response = await api.get<unknown>("/brands", { params });
  return normalizeList<Brand>(response.data);
}

export async function getBrandById(brandId: number) {
  const response = await api.get<Brand>(`/brands/${brandId}`);
  return response.data;
}

export async function getBrandMedia(brandId: number) {
  const response = await api.get<unknown>(`/brands/${brandId}/media`);
  return normalizeList<BrandMedia>(response.data);
}

export async function getBrandFdds(brandId: number) {
  const response = await api.get<unknown>(`/brands/${brandId}/fdd`);
  return normalizeList<BrandFdd>(response.data);
}

export async function getBrandTerritories(brandId: number) {
  const response = await api.get<unknown>(`/brands/${brandId}/territories`);
  return normalizeList<Territory>(response.data);
}

export async function compareBrands(payload: BrandCompareRequest) {
  const response = await api.post<unknown>("/brands/compare", payload);
  return parseCompareResult(response.data);
}

export async function getBuyerFavorites() {
  const response = await api.get<unknown>("/buyer/favorites");
  return normalizeList<Brand>(response.data);
}

export async function addBuyerFavorite(brandId: number) {
  const response = await api.post(`/buyer/favorites/${brandId}`);
  return response.data;
}

export async function removeBuyerFavorite(brandId: number) {
  await api.delete(`/buyer/favorites/${brandId}`);
}

export async function getBuyerApplications() {
  const response = await api.get<unknown>("/buyer/applications");
  return normalizeList<Application>(response.data);
}

export async function getBuyerApplicationById(id: number) {
  const response = await api.get<Application>(`/buyer/applications/${id}`);
  return response.data;
}

export async function getBuyerDashboardSummary(): Promise<BuyerDashboardSummary> {
  const response = await api.get<BuyerDashboardSummary>("/buyer/dashboard/summary");
  return response.data;
}

export async function submitBuyerQualification(payload: BuyerQualificationRequest) {
  const response = await api.post<unknown>("/buyer/qualification", payload);
  return normalizeList<Brand>(response.data);
}

export async function createApplication(payload: ApplicationCreateRequest) {
  const response = await api.post("/applications", payload);
  return response.data;
}

export async function getApplicationById(id: number) {
  const response = await api.get<Application>(`/applications/${id}`);
  return response.data;
}

export async function getMyBrandApplications() {
  const response = await api.get<unknown>("/applications/my-brand");
  return normalizeList<Application>(response.data);
}

export async function updateApplicationStatus(applicationId: number, payload: ApplicationUpdateRequest) {
  const response = await api.patch<Application>(`/applications/${applicationId}`, payload);
  return response.data;
}

export async function createMessage(payload: MessageCreateRequest) {
  const response = await api.post<Message>("/messages", payload);
  return response.data;
}

export async function getMessages(applicationId: number) {
  const response = await api.get<unknown>(`/messages/${applicationId}`);
  return normalizeList<Message>(response.data);
}

export async function markMessageRead(messageId: number) {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
}

export async function markApplicationMessagesRead(applicationId: number) {
  const response = await api.patch(`/messages/${applicationId}/read-all`);
  return response.data;
}

export async function getConversations() {
  const response = await api.get<unknown>("/conversations");
  return normalizeList<ConversationItem>(response.data);
}

export async function getNotifications() {
  const response = await api.get<unknown>("/notifications");
  return normalizeList<Notification>(response.data);
}

export async function markNotificationRead(id: number) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.post("/notifications/read-all");
  return response.data;
}

export async function globalSearch(q: string): Promise<SearchResults> {
  const response = await api.get<SearchResults>("/search", { params: { q } });
  const data = response.data;
  return {
    brands: normalizeList<Brand>(data.brands),
    applications: normalizeList<Application>(data.applications),
  };
}

export async function getFranchiseDashboardSummary(): Promise<FranchiseDashboardSummary> {
  const response = await api.get<unknown>("/franchise-owner/dashboard/summary");
  return parseFranchiseDashboardSummary(response.data);
}

export async function getFranchiseMyBrand(): Promise<Brand | null> {
  try {
    const response = await api.get<Brand | null>("/franchise-owner/my-brand");
    return response.data ?? null;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function createFranchiseBrand(payload: BrandCreateRequest) {
  const response = await api.post<Brand>("/franchise-owner/brand", payload);
  return response.data;
}

export async function updateFranchiseBrand(payload: BrandUpdateRequest) {
  const response = await api.patch<Brand>("/franchise-owner/brand", payload);
  return response.data;
}

export async function getOutlets() {
  const response = await api.get<unknown>("/franchise-owner/outlets");
  return normalizeList<Outlet>(response.data);
}

export async function createOutlet(payload: OutletCreateRequest) {
  const response = await api.post<Outlet>("/franchise-owner/outlets", payload);
  return response.data;
}

export async function updateOutlet(id: number, payload: Partial<OutletCreateRequest>) {
  const response = await api.patch<Outlet>(`/franchise-owner/outlets/${id}`, payload);
  return response.data;
}

export async function deleteOutlet(id: number) {
  await api.delete(`/franchise-owner/outlets/${id}`);
}

export async function getFranchiseDocuments() {
  const response = await api.get<unknown>("/franchise-owner/documents");
  return normalizeList<FranchiseDocument>(response.data);
}

export async function uploadFranchiseDocument(payload: FormData) {
  const response = await api.post<FranchiseDocument>("/franchise-owner/documents", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getFranchiseAnalytics(): Promise<FranchiseAnalytics> {
  const response = await api.get<unknown>("/franchise-owner/analytics");
  const d = response.data && typeof response.data === "object" ? (response.data as Record<string, unknown>) : {};

  const supplyRaw = d.supply_requests_by_status;
  const supply_requests_by_status: Record<string, number> =
    supplyRaw && typeof supplyRaw === "object" && !Array.isArray(supplyRaw)
      ? (supplyRaw as Record<string, number>)
      : {};

  return {
    applications_by_month: normalizeList<{ month: string; count: number }>(d.applications_by_month),
    inventory_total_quantity:
      typeof d.inventory_total_quantity === "number" && Number.isFinite(d.inventory_total_quantity)
        ? d.inventory_total_quantity
        : 0,
    supply_requests_by_status,
  };
}

export async function getInventory(options?: { scope?: "center" | "outlet" | "all" }) {
  const params =
    options?.scope && options.scope !== "all" ? { scope: options.scope } : undefined;
  const response = await api.get<unknown>("/inventory", { params });
  return normalizeList<InventoryItem>(response.data);
}

export async function getLowStockInventory(threshold = 10, scope?: "center" | "outlet") {
  const response = await api.get<unknown>("/inventory/low-stock", {
    params: { threshold, ...(scope ? { scope } : {}) },
  });
  return normalizeList<InventoryItem>(response.data);
}

export async function createInventoryItem(payload: Record<string, unknown>) {
  const response = await api.post<InventoryItem>("/inventory", payload);
  return response.data;
}

export async function updateInventoryItem(inventoryId: number, payload: Record<string, unknown>) {
  const response = await api.patch<InventoryItem>(`/inventory/${inventoryId}`, payload);
  return response.data;
}

export async function deleteInventoryItem(inventoryId: number) {
  await api.delete(`/inventory/${inventoryId}`);
}

export async function transferInventory(payload: InventoryTransferRequest) {
  const response = await api.post("/inventory/transfer", payload);
  return response.data;
}

export async function getMySupplyRequests() {
  const response = await api.get<unknown>("/supply-requests");
  return normalizeList<SupplyRequest>(response.data);
}

export async function getIncomingSupplyRequests() {
  const response = await api.get<unknown>("/supply-requests", {
    params: { source: "incoming" },
  });
  return normalizeList<SupplyRequest>(response.data);
}

export async function getBuyerSupplyRequests() {
  const response = await api.get<SupplyRequest[]>("/buyer/supply-requests");
  return response.data ?? [];
}

export async function createBuyerSupplyRequest(payload: BuyerSupplyRequestCreate) {
  const response = await api.post<SupplyRequest>("/buyer/supply-requests", payload);
  return response.data;
}

export async function getBuyerBrandOutlets(brandId: number) {
  const response = await api.get<unknown>(`/buyer/brands/${brandId}/outlets`);
  return normalizeList<Outlet>(response.data);
}

export async function getBuyerBrandCenterInventory(brandId: number) {
  const response = await api.get<unknown>(`/buyer/brands/${brandId}/center-inventory`);
  return normalizeList<InventoryItem>(response.data);
}

export async function getSupplyRequestById(id: number) {
  const response = await api.get<SupplyRequest>(`/supply-requests/${id}`);
  return response.data;
}

export async function updateSupplyRequest(id: number, payload: SupplyRequestUpdateRequest) {
  const response = await api.patch<SupplyRequest>(`/supply-requests/${id}`, payload);
  return response.data;
}

export async function createBulkSupplyRequest(payload: SupplyBulkRequest) {
  const response = await api.post<unknown>("/supply-requests/bulk", payload);
  return response.data;
}

export async function getSupplyPool() {
  const response = await api.get<unknown>("/supply-requests/pool");
  return normalizeList<SupplyPoolItem>(response.data);
}

function normalizeAssistantResponse(data: AssistantQueryResponse): AssistantQueryResponse {
  const brands = data.brands?.length ? data.brands : data.related_brands ?? [];
  return {
    ...data,
    answer: data.answer || data.reply || "",
    brands,
  };
}

export async function postAgentChat(payload: AssistantChatRequest) {
  const response = await api.post<AssistantQueryResponse>("/agent/chat", payload);
  return normalizeAssistantResponse(response.data);
}

export async function postAgentQuery(payload: Omit<AssistantChatRequest, "new_session">) {
  const response = await api.post<AssistantQueryResponse>("/agent/query", payload);
  return normalizeAssistantResponse(response.data);
}

export async function getAgentSessions() {
  const response = await api.get<AgentSession[]>("/agent/sessions");
  return response.data;
}

export async function getAgentSession(sessionId: number) {
  const response = await api.get<AgentSessionDetail>(`/agent/sessions/${sessionId}`);
  return response.data;
}

export async function deleteAgentSession(sessionId: number) {
  await api.delete(`/agent/sessions/${sessionId}`);
}
