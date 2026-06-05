import { SupplyRequestStatus } from "@/lib/types";

/** Backend `supply_service._TRANSITIONS` ile aynı — merkez onayı için. */
export const SUPPLY_CENTER_ACTIONS: Record<
  SupplyRequestStatus,
  Array<{ status: SupplyRequestStatus; label: string; variant: "primary" | "secondary" | "ghost" }>
> = {
  pending: [
    { status: "approved", label: "Onayla", variant: "primary" },
    { status: "rejected", label: "Reddet", variant: "ghost" },
  ],
  approved: [
    { status: "shipped", label: "Yola çıkar", variant: "primary" },
    { status: "rejected", label: "Reddet", variant: "ghost" },
  ],
  shipped: [],
  rejected: [],
};
