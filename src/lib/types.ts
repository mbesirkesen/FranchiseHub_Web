export type UserRole = "buyer" | "franchise_owner" | "admin";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
};

export type Brand = {
  id: number;
  name: string;
  sector?: string | null;
  location?: string | null;
  min_investment_cost?: number | null;
  max_investment_cost?: number | null;
  initial_cost?: number | null;
  description?: string | null;
  support_details?: string | null;
  is_approved?: boolean;
};

/** POST/PATCH /franchise-owner/brand — backend FranchiseHub Frontend Contract ile uyumlu. */
export type BrandUpdateRequest = {
  name?: string;
  sector?: string | null;
  location?: string | null;
  min_investment_cost?: number | null;
  max_investment_cost?: number | null;
  initial_cost?: number | null;
  description?: string | null;
  support_details?: string | null;
};

export type BrandCreateRequest = BrandUpdateRequest & {
  name: string;
};

/** GET /franchise-owner/dashboard/summary — normalize edilmiş alanlar. */
export type FranchiseDashboardSummary = {
  has_brand: boolean;
  brand_id: number | null;
  brand_name: string | null;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  total_applications: number;
  inventory_item_count: number;
  supply_requests_pending: number;
  supply_request_total: number;
};

export type BrandCompareRequest = {
  brand_ids: number[];
};

export type ApplicationCreateRequest = {
  brand_id: number;
  notes: string;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationUpdateRequest = {
  status: "approved" | "rejected";
  notes?: string;
};

/** GET /applications/my-brand — backend alanları esnek tutuldu. */
export type Application = {
  id: number;
  status: ApplicationStatus;
  notes?: string | null;
  brand_id?: number;
  buyer_id?: number;
  created_at?: string;
};

export type MessageCreateRequest = {
  application_id: number;
  content: string;
};

export type Message = {
  id?: number;
  application_id?: number;
  content: string;
  created_at?: string;
  sender_id?: number;
  is_from_buyer?: boolean;
  sender_role?: string;
};

export type InventoryItem = {
  id: number;
  product_name?: string;
  quantity?: number;
  sku?: string;
  unit?: string;
};

export type SupplyBulkRequest = {
  requests: Array<{
    product_name: string;
    quantity: number;
  }>;
};

export type BrandApproveRequest = {
  is_approved: boolean;
};

export type AdminApplicationOverrideRequest = {
  status: ApplicationStatus;
  notes?: string;
};

export type BuyerRegisterRequest = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  investment_budget: number;
  experience_years: number;
  preferred_sector: string;
  identity_number?: string;
  password: string;
};

export type FranchiseOwnerRegisterRequest = {
  email: string;
  company_name: string;
  tax_number: string;
  phone: string;
  authorized_person_name: string;
  country: string;
  city: string;
  company_address: string;
  website?: string;
  verification_status?: boolean;
  password: string;
};

export type AdminRegisterRequest = {
  email: string;
  full_name: string;
  phone: string;
  authorization_level: string;
  is_superadmin?: boolean;
  password: string;
};
