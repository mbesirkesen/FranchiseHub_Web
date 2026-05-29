export type UserRole = "buyer" | "franchise_owner";

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

export type UserProfile = {
  id?: number;
  email?: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  city?: string;
  company_name?: string;
  investment_budget?: number;
  preferred_sector?: string;
};

export type ProfileUpdateRequest = {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  city?: string;
  company_name?: string;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};

export type BuyerDashboardSummary = {
  favorites_count: number;
  applications_pending: number;
  applications_approved: number;
  applications_rejected: number;
  applications_total: number;
};

export type BuyerQualificationRequest = {
  investment_budget: number;
  preferred_sector: string;
  experience_years: number;
  city?: string;
};

export type Notification = {
  id: number;
  title?: string;
  body?: string;
  read?: boolean;
  created_at?: string;
  type?: string;
  link?: string;
};

export type BrandMedia = {
  id?: number;
  url: string;
  kind?: "logo" | "gallery" | string;
  alt?: string;
};

export type BrandFdd = {
  id: number;
  title?: string;
  year?: number;
  file_url?: string;
  created_at?: string;
};

export type Territory = {
  id: number;
  name?: string;
  city?: string;
  region?: string;
  is_available?: boolean;
  notes?: string;
};

export type Outlet = {
  id: number;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
};

export type OutletCreateRequest = {
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
};

export type FranchiseDocument = {
  id: number;
  title: string;
  description?: string | null;
  file_url?: string | null;
  created_at?: string;
};

export type SupplyRequestStatus = "pending" | "approved" | "rejected" | "shipped";

export type SupplyRequest = {
  id: number;
  product_name?: string;
  quantity?: number;
  status?: SupplyRequestStatus;
  created_at?: string;
  notes?: string | null;
};

export type SupplyRequestUpdateRequest = {
  status: SupplyRequestStatus;
  notes?: string;
};

export type InventoryTransferRequest = {
  from_outlet_id?: number | null;
  to_outlet_id?: number | null;
  inventory_id: number;
  quantity: number;
};

export type SearchResults = {
  brands: Brand[];
  applications: Application[];
};

export type FranchiseAnalytics = {
  applications_by_month: Array<{ month: string; count: number }>;
  inventory_total_quantity: number;
  supply_requests_by_status: Record<string, number>;
};

export type ConversationSummary = {
  application_id: number;
  brand_id?: number;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
};
