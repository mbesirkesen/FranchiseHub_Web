import { Brand } from "@/lib/types";

/** Markanın gerektirdiği en düşük yatırım tutarı (TL). */
export function brandMinimumInvestment(brand: Brand): number | null {
  const values = [brand.min_investment_cost, brand.initial_cost].filter(
    (v): v is number => v != null && v > 0,
  );
  if (values.length === 0) {
    if (brand.max_investment_cost != null && brand.max_investment_cost > 0) {
      return brand.max_investment_cost;
    }
    return null;
  }
  return Math.min(...values);
}

/** Bütçe = yatırımcının karşılayabileceği üst limit; min maliyet bütçeden küçük/eşitse uygun. */
export function brandMatchesBudget(brand: Brand, budget: number): boolean {
  const minimum = brandMinimumInvestment(brand);
  if (minimum == null) return true;
  return budget >= minimum;
}
