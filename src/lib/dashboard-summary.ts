import { FranchiseDashboardSummary } from "@/lib/types";

/**
 * FranchiseHub Frontend Contract — GET /franchise-owner/dashboard/summary
 * Resmi alanlar: applications_*, supply_requests_*, has_brand, brand_id, brand_name, inventory_item_count
 */
export function parseFranchiseDashboardSummary(data: unknown): FranchiseDashboardSummary {
  const d = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const pickNum = (...keys: string[]): number => {
    for (const k of keys) {
      const v = d[k];
      if (typeof v === "number" && Number.isFinite(v)) {
        return v;
      }
      if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
        return Number(v);
      }
    }
    return 0;
  };

  const pickStr = (...keys: string[]): string | null => {
    for (const k of keys) {
      const v = d[k];
      if (typeof v === "string" && v.length > 0) {
        return v;
      }
    }
    return null;
  };

  const pickId = (): number | null => {
    const v = d.brand_id;
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
    if (typeof v === "string" && Number.isFinite(Number(v))) {
      return Number(v);
    }
    return null;
  };

  const pending = pickNum(
    "applications_pending",
    "pending_applications",
    "pending",
    "pending_count",
  );
  const approved = pickNum(
    "applications_approved",
    "approved_applications",
    "approved",
    "approved_count",
  );
  const rejected = pickNum(
    "applications_rejected",
    "rejected_applications",
    "rejected",
    "rejected_count",
  );
  const total = pickNum(
    "applications_total",
    "total_applications",
    "total",
    "applications_total_count",
    "total_count",
  );

  const brandId = pickId();
  const brandName = pickStr("brand_name");
  const hasBrandExplicit =
    d.has_brand === true ||
    d.has_brand === 1 ||
    (typeof d.has_brand === "string" && d.has_brand.toLowerCase() === "true");
  const hasBrandInferred = brandId != null || (brandName != null && brandName.length > 0);
  const has_brand = hasBrandExplicit || hasBrandInferred;

  return {
    has_brand,
    brand_id: brandId,
    brand_name: brandName,
    pending_applications: pending,
    approved_applications: approved,
    rejected_applications: rejected,
    total_applications: total,
    inventory_item_count: pickNum(
      "inventory_item_count",
      "inventory_count",
      "inventory_items",
      "inventory_total",
    ),
    supply_requests_pending: pickNum(
      "supply_requests_pending",
      "supply_pending",
      "pending_supply_requests",
    ),
    supply_request_total: pickNum(
      "supply_requests_total",
      "supply_request_count",
      "supply_requests",
      "my_supply_request_count",
      "supply_requests_total_count",
    ),
  };
}
