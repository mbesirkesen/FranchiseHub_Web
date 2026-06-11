"use client";

import { compareColumns, compareFieldLabel } from "@/lib/compare-utils";

type Props = {
  rows: Array<Record<string, string | number | null>>;
  /** Asistan balonu gibi dar alanlarda tam genişlik + kaydırma */
  variant?: "default" | "agent";
};

const LONG_FIELDS = new Set(["description", "support_details"]);

function formatCell(value: string | number | null): string {
  if (value == null || value === "") return "—";
  if (typeof value === "number") {
    return value >= 1000 ? `₺${value.toLocaleString("tr-TR")}` : String(value);
  }
  return String(value);
}

export function CompareTable({ rows, variant = "default" }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">Karşılaştırma sonucu boş.</p>;
  }

  const columns = compareColumns(rows);
  const isAgent = variant === "agent";

  return (
    <div
      className={`compare-table-wrap${isAgent ? " compare-table-wrap-agent" : ""}`}
      role="region"
      aria-label="Marka karşılaştırma tablosu"
      tabIndex={0}
    >
      <table className={`compare-table data-table${isAgent ? " compare-table-agent" : ""}`}>
        <thead>
          <tr>
            <th scope="col">Alan</th>
            {rows.map((row, i) => (
              <th key={i} scope="col">
                {row.name != null && row.name !== "" ? String(row.name) : `Marka ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => {
            const isLong = LONG_FIELDS.has(col);
            return (
              <tr key={col}>
                <th scope="row" className="compare-table-field">
                  {compareFieldLabel(col)}
                </th>
                {rows.map((row, i) => {
                  const text = formatCell(row[col]);
                  return (
                    <td key={i} className={isLong ? "compare-table-cell-long" : undefined} title={isLong ? text : undefined}>
                      {text}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
