import { Brand } from "@/lib/types";

export type BrandSearchFilters = {
  sector?: string;
  location?: string;
  region?: "marmara" | "ege" | "akdeniz" | "icanadolu" | "karadeniz" | "dogu";
  maxBudget?: number;
  minBudget?: number;
  q?: string;
};

const REGION_CITIES: Record<string, string[]> = {
  marmara: ["istanbul", "bursa", "kocaeli", "tekirdağ", "tekirdag", "balıkesir", "balikesir", "çanakkale", "canakkale", "edirne", "sakarya", "yalova"],
  ege: ["izmir", "aydın", "aydin", "manisa", "muğla", "mugla", "denizli"],
  akdeniz: ["antalya", "adana", "mersin", "hatay"],
  icanadolu: ["ankara", "konya", "kayseri", "eskişehir", "eskisehir"],
  karadeniz: ["trabzon", "samsun", "ordu", "rize"],
  dogu: ["erzurum", "van", "diyarbakır", "diyarbakir"],
};

export function parseAgentQuery(query: string): BrandSearchFilters {
  const q = query.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const filters: BrandSearchFilters = {};

  if (q.includes("fast-food") || q.includes("fast food") || q.includes("hamburger") || q.includes("burger")) {
    filters.sector = "Gıda";
    filters.q = "fast";
  } else if (q.includes("gida") || q.includes("gıda") || q.includes("restoran") || q.includes("yemek")) {
    filters.sector = "Gıda";
  } else if (q.includes("kahve") || q.includes("cafe")) {
    filters.sector = "Kahve";
  } else if (q.includes("guzellik") || q.includes("güzellik") || q.includes("kuafor")) {
    filters.sector = "Güzellik";
  } else if (q.includes("perakende") || q.includes("magaza") || q.includes("mağaza")) {
    filters.sector = "Perakende";
  }

  if (q.includes("marmara")) filters.region = "marmara";
  else if (q.includes("ege")) filters.region = "ege";
  else if (q.includes("akdeniz")) filters.region = "akdeniz";
  else if (q.includes("ic anadolu") || q.includes("iç anadolu")) filters.region = "icanadolu";
  else if (q.includes("karadeniz")) filters.region = "karadeniz";
  else if (q.includes("dogu") || q.includes("doğu")) filters.region = "dogu";

  if (q.includes("istanbul")) filters.location = "İstanbul";
  else if (q.includes("ankara")) filters.location = "Ankara";
  else if (q.includes("izmir")) filters.location = "İzmir";
  else if (q.includes("bursa")) filters.location = "Bursa";
  else if (q.includes("antalya")) filters.location = "Antalya";

  const budgetMatch = q.match(/(\d[\d.,]*)\s*(bin|k|milyon|tl|₺)?/);
  if (budgetMatch) {
    let n = Number(budgetMatch[1].replace(/\./g, "").replace(",", "."));
    if (q.includes("bin") || budgetMatch[2] === "k") n *= 1000;
    if (q.includes("milyon")) n *= 1_000_000;
    if (q.includes("alti") || q.includes("altı") || q.includes("uygun") || q.includes("max") || q.includes("butce") || q.includes("bütçe")) {
      filters.maxBudget = n;
    } else {
      filters.minBudget = Math.max(0, n * 0.7);
      filters.maxBudget = n * 1.3;
    }
  }

  if (q.includes("butceme") || q.includes("bütçeme")) {
    filters.maxBudget = filters.maxBudget ?? 2_000_000;
  }

  return filters;
}

function matchesRegion(location: string | null | undefined, region: string): boolean {
  if (!location) return true;
  const loc = location.toLowerCase();
  const cities = REGION_CITIES[region] ?? [];
  return cities.some((c) => loc.includes(c));
}

export function filterBrandsByAgent(brands: Brand[], filters: BrandSearchFilters): Brand[] {
  return brands.filter((brand) => {
    if (filters.sector && brand.sector) {
      if (!brand.sector.toLowerCase().includes(filters.sector.toLowerCase())) return false;
    } else if (filters.sector && !brand.sector) {
      return false;
    }

    if (filters.location && brand.location) {
      if (!brand.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    }

    if (filters.region && !matchesRegion(brand.location, filters.region)) return false;

    const min = brand.min_investment_cost ?? 0;
    const max = brand.max_investment_cost ?? min * 2;
    if (filters.maxBudget != null && min > filters.maxBudget) return false;
    if (filters.minBudget != null && max > 0 && max < filters.minBudget) return false;

    if (filters.q && brand.name) {
      const hay = `${brand.name} ${brand.description ?? ""} ${brand.sector ?? ""}`.toLowerCase();
      if (!hay.includes(filters.q)) return false;
    }

    return true;
  });
}

export function describeAgentFilters(filters: BrandSearchFilters): string {
  const parts: string[] = [];
  if (filters.sector) parts.push(filters.sector);
  if (filters.region) parts.push(`${filters.region} bölgesi`);
  if (filters.location) parts.push(filters.location);
  if (filters.maxBudget) parts.push(`${new Intl.NumberFormat("tr-TR").format(filters.maxBudget)} TL altı`);
  return parts.length ? parts.join(" · ") : "tüm kriterler";
}
