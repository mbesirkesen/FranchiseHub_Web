import { redirect } from "next/navigation";

export default function FranchiseInventoryRedirect() {
  redirect("/franchise-owner/stock?tab=depo");
}
