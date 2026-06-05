"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InventoryPanel } from "@/app/franchise-owner/_components/inventory-panel";
import { SupplyCenterPanel } from "@/app/franchise-owner/_components/supply-center-panel";
import { FriendlyHeader, HelpBox, PanelTabs } from "@/components/ui/simple-blocks";

const TABS = [
  { id: "talepler", label: "Bayi talepleri", icon: "📋" },
  { id: "depo", label: "Merkez deposu", icon: "📦" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabFromParam(value: string | null): TabId {
  return value === "depo" ? "depo" : "talepler";
}

export default function FranchiseStockPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const initialTab = tabFromParam(tabParam);
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setTab(tabFromParam(tabParam));
  }, [tabParam]);

  const changeTab = (id: string) => {
    const next = tabFromParam(id);
    setTab(next);
    router.replace(`/franchise-owner/stock?tab=${next}`, { scroll: false });
  };

  return (
    <div>
      <FriendlyHeader
        title="Tedarik yönetimi"
        subtitle="Bayi malzeme talepleri ve merkez deposu."
      />

      <HelpBox>
        <strong>Bayi talepleri:</strong> onaylı bayilerden gelen istekleri yönetin.{" "}
        <strong>Merkez deposu:</strong> marka merkezinin stok envanterini güncelleyin.
      </HelpBox>

      <div className="mt-4">
        <PanelTabs tabs={[...TABS]} active={tab} onChange={changeTab} />
      </div>

      {tab === "talepler" ? <SupplyCenterPanel /> : <InventoryPanel />}
    </div>
  );
}
