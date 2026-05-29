import { FranchiseDashboardSummary } from "@/lib/types";

/** GET /franchise-owner/dashboard/summary — yalnızca backend kontrat alanları. */
export function parseFranchiseDashboardSummary(data: unknown): FranchiseDashboardSummary {
  const d = data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const num = (key: string): number => {
    const v = d[key];
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
      return Number(v);
    }
    return 0;
  };

  const brandIdRaw = d.brand_id;
  const brand_id =
    typeof brandIdRaw === "number" && Number.isFinite(brandIdRaw)
      ? brandIdRaw
      : typeof brandIdRaw === "string" && Number.isFinite(Number(brandIdRaw))
        ? Number(brandIdRaw)
        : null;

  const brandNameRaw = d.brand_name;
  const brand_name = typeof brandNameRaw === "string" && brandNameRaw.length > 0 ? brandNameRaw : null;

  const hasBrandRaw = d.has_brand;
  const has_brand =
    hasBrandRaw === true ||
    hasBrandRaw === 1 ||
    (typeof hasBrandRaw === "string" && hasBrandRaw.toLowerCase() === "true");

  return {
    has_brand,
    brand_id,
    brand_name,
    pending_applications: num("pending_applications"),
    approved_applications: num("approved_applications"),
    rejected_applications: num("rejected_applications"),
    total_applications: num("total_applications"),
    inventory_item_count: num("inventory_item_count"),
    supply_requests_pending: num("supply_requests_pending"),
    supply_request_total: num("supply_request_total"),
  };
}
