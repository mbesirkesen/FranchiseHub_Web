import { redirect } from "next/navigation";

export default function BuyerFavoritesRedirect() {
  redirect("/buyer/discover?tab=favori");
}
