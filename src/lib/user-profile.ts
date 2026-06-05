import { UserProfile, UserRole } from "@/lib/types";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** GET/PATCH /auth/me — backend buyer / franchise_owner iç içe döner. */
export function normalizeUserProfile(data: unknown): UserProfile {
  const root = record(data) ?? {};
  const role = root.role as UserRole | undefined;

  if (str(root.email) || str(root.first_name)) {
    return {
      id: num(root.id),
      email: str(root.email),
      role,
      first_name: str(root.first_name),
      last_name: str(root.last_name),
      full_name: str(root.full_name),
      phone: str(root.phone),
      city: str(root.city),
      company_name: str(root.company_name),
      investment_budget: num(root.investment_budget),
      preferred_sector: str(root.preferred_sector),
    };
  }

  const buyer = record(root.buyer);
  if (buyer) {
    return {
      id: num(buyer.id),
      email: str(buyer.email),
      role: role ?? "buyer",
      first_name: str(buyer.first_name),
      last_name: str(buyer.last_name),
      phone: str(buyer.phone),
      city: str(buyer.city),
      investment_budget: num(buyer.investment_budget),
      preferred_sector: str(buyer.preferred_sector),
    };
  }

  const owner = record(root.franchise_owner);
  if (owner) {
    const authorized = str(owner.authorized_person_name) ?? "";
    const parts = authorized.split(/\s+/).filter(Boolean);
    return {
      id: num(owner.id),
      email: str(owner.email),
      role: role ?? "franchise_owner",
      full_name: authorized || undefined,
      first_name: parts[0],
      last_name: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
      phone: str(owner.phone),
      city: str(owner.city),
      company_name: str(owner.company_name),
    };
  }

  return { role };
}
