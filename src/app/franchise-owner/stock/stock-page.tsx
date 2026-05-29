"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InventoryPanel } from "@/app/franchise-owner/_components/inventory-panel";
import { SupplyPanel } from "@/app/franchise-owner/_components/supply-panel";
import { FriendlyHeader, HelpBox, PanelTabs } from "@/components/ui/simple-blocks";

const TABS = [
  { id: "depo", label: "Depom", icon: "📦" },
  { id: "siparis", label: "Sipariş ver", icon: "🚚" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FranchiseStockPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const initialTab: TabId = tabParam === "siparis" ? "siparis" : "depo";
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setTab(tabParam === "siparis" ? "siparis" : "depo");
  }, [tabParam]);

  const changeTab = (id: string) => {
    const next = id === "siparis" ? "siparis" : "depo";
    setTab(next);
    router.replace(`/franchise-owner/stock?tab=${next}`, { scroll: false });
  };

  return (
    <div>
      <FriendlyHeader
        title="Depo & sipariş"
        subtitle="Elinizde ne var, ne lazım — hepsi burada."
      />

      <HelpBox>
        <strong>Depom:</strong> stoktaki ürünler. <strong>Sipariş ver:</strong> merkeze malzeme talebi gönderin.
      </HelpBox>

      <div className="mt-4">
        <PanelTabs tabs={[...TABS]} active={tab} onChange={changeTab} />
      </div>

      {tab === "depo" ? <InventoryPanel /> : <SupplyPanel />}
    </div>
  );
}
