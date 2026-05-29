/** POST /brands/compare cevabını tabloya dönüştürür. */
export function parseCompareResult(data: unknown): Array<Record<string, string | number | null>> {
  if (data == null) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((row) => normalizeRow(row));
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.brands)) {
      return obj.brands.map((row) => normalizeRow(row));
    }
    if (Array.isArray(obj.items)) {
      return obj.items.map((row) => normalizeRow(row));
    }
    if (obj.comparison && typeof obj.comparison === "object") {
      return [normalizeRow(obj.comparison)];
    }
  }

  return [];
}

function normalizeRow(row: unknown): Record<string, string | number | null> {
  if (row == null || typeof row !== "object") {
    return { value: String(row) };
  }
  const out: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
    if (v == null) {
      out[k] = null;
    } else if (typeof v === "number" || typeof v === "string") {
      out[k] = v;
    } else {
      out[k] = JSON.stringify(v);
    }
  }
  return out;
}

export function compareColumns(rows: Array<Record<string, string | number | null>>): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => keys.add(k));
  }
  const preferred = ["id", "name", "sector", "location", "min_investment_cost", "max_investment_cost", "initial_cost"];
  const rest = [...keys].filter((k) => !preferred.includes(k)).sort();
  return [...preferred.filter((k) => keys.has(k)), ...rest];
}
