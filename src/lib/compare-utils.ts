/** POST /brands/compare ve asistan compare cevabını tabloya dönüştürür. */
export function parseCompareResult(data: unknown): Array<Record<string, string | number | null>> {
  if (data == null) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((row) => normalizeRow(row));
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const table = obj.comparison_table;
    if (table && typeof table === "object") {
      return parseComparisonTable(table as ComparisonTableShape);
    }
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

type ComparisonTableShape = {
  columns?: Array<{ brand_id?: number; name?: string }>;
  rows?: Array<{ key?: string; label?: string; values?: Array<string | null> }>;
};

/** comparison_table (satır=alan, sütun=marka) → marka satırları */
function parseComparisonTable(table: ComparisonTableShape): Array<Record<string, string | number | null>> {
  const columns = table.columns ?? [];
  const fieldRows = table.rows ?? [];
  if (columns.length === 0) {
    return [];
  }
  return columns.map((col, colIndex) => {
    const brandRow: Record<string, string | number | null> = {
      name: col.name ?? `Marka ${colIndex + 1}`,
    };
    if (col.brand_id != null) {
      brandRow.id = col.brand_id;
    }
    for (const field of fieldRows) {
      const key = field.key ?? field.label ?? "field";
      brandRow[key] = field.values?.[colIndex] ?? null;
    }
    return brandRow;
  });
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
  const rest = [...keys].filter((k) => !preferred.includes(k) && k !== "id" && k !== "name").sort();
  return [...preferred.filter((k) => keys.has(k) && k !== "id" && k !== "name"), ...rest];
}

const COMPARE_FIELD_LABELS: Record<string, string> = {
  sector: "Sektör",
  location: "Konum",
  initial_cost: "Yatırım",
  min_investment_cost: "Min. yatırım",
  max_investment_cost: "Maks. yatırım",
  support_details: "Destek",
  description: "Açıklama",
};

export function compareFieldLabel(key: string): string {
  return COMPARE_FIELD_LABELS[key] ?? key;
}
