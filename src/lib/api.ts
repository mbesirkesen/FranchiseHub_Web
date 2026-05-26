import axios from "axios";
import { clearSession, getAccessToken } from "@/lib/auth";
import { parseFranchiseDashboardSummary } from "@/lib/dashboard-summary";
import { normalizeList } from "@/lib/list-utils";
import {
  AdminApplicationOverrideRequest,
  AdminRegisterRequest,
  ApplicationCreateRequest,
  ApplicationUpdateRequest,
  BrandApproveRequest,
  BrandCompareRequest,
  Brand,
  BrandCreateRequest,
  BrandUpdateRequest,
  BuyerRegisterRequest,
  FranchiseDashboardSummary,
  FranchiseOwnerRegisterRequest,
  LoginRequest,
  LoginResponse,
  Application,
  InventoryItem,
  Message,
  MessageCreateRequest,
  SupplyBulkRequest,
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

/** Oturum süresi dolmuş veya token reddedildiğinde tekrar girişe yönlendir (login/register hariç). */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
    const isAuthFlow =
      url.includes("/auth/login") ||
      url.includes("/auth/register/");

    if (typeof window !== "undefined" && !isAuthFlow && getAccessToken()) {
      clearSession();
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

/**
 * POST /auth/login — backend: application/json gövde, { email, password }.
 * Form-urlencoded + username kullanımı bu API ile 422 üretir.
 */
export async function login(payload: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
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

export async function registerAdmin(payload: AdminRegisterRequest) {
  const response = await api.post("/auth/register/admin", payload);
  return response.data;
}

type GetBrandsParams = {
  sector?: string;
  min_cost?: number;
  max_cost?: number;
  location?: string;
};

export async function getBrands(params?: GetBrandsParams) {
  const response = await api.get<unknown>("/brands", { params });
  return normalizeList<Brand>(response.data);
}

export async function getBrandById(brandId: number) {
  const response = await api.get<Brand>(`/brands/${brandId}`);
  return response.data;
}

export async function getFranchiseDashboardSummary(): Promise<FranchiseDashboardSummary> {
  const response = await api.get<unknown>("/franchise-owner/dashboard/summary");
  return parseFranchiseDashboardSummary(response.data);
}

/** Bağlı marka; yoksa null (backend: 200 + JSON null; 404 savunma amaçlı da null sayılır). */
export async function getFranchiseMyBrand(): Promise<Brand | null> {
  try {
    const response = await api.get<Brand | null>("/franchise-owner/my-brand");
    const data = response.data;
    if (data == null) {
      return null;
    }
    return data;
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

/** Mevcut markayı günceller; backend yalnızca POST destekliyorsa burayı POST ile değiştirin. */
export async function updateFranchiseBrand(payload: BrandUpdateRequest) {
  const response = await api.patch<Brand>("/franchise-owner/brand", payload);
  return response.data;
}

export async function compareBrands(payload: BrandCompareRequest) {
  const response = await api.post("/brands/compare", payload);
  return response.data;
}

export async function createApplication(payload: ApplicationCreateRequest) {
  const response = await api.post("/applications", payload);
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

export async function getInventory() {
  const response = await api.get<unknown>("/inventory");
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

export async function getMySupplyRequests() {
  const response = await api.get<unknown>("/supply-requests");
  return normalizeList<unknown>(response.data);
}

export async function createBulkSupplyRequest(payload: SupplyBulkRequest) {
  const response = await api.post<unknown>("/supply-requests/bulk", payload);
  return response.data;
}

export async function getSupplyPool() {
  const response = await api.get<unknown>("/supply-requests/pool");
  return normalizeList<unknown>(response.data);
}

export async function getAdminUsers() {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function approveBrand(brandId: number, payload: BrandApproveRequest) {
  const response = await api.patch(`/admin/brands/${brandId}/approve`, payload);
  return response.data;
}

export async function adminOverrideApplication(
  applicationId: number,
  payload: AdminApplicationOverrideRequest,
) {
  const response = await api.patch(`/admin/applications/${applicationId}/override`, payload);
  return response.data;
}
