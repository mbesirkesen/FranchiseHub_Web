"use client";

import { compareColumns } from "@/lib/compare-utils";

type Props = {
  rows: Array<Record<string, string | number | null>>;
};

export function CompareTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">Karşılaştırma sonucu boş.</p>;
  }

  const columns = compareColumns(rows);

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="data-table">
        <thead>
          <tr>
            <th>Alan</th>
            {rows.map((_, i) => (
              <th key={i}>Marka {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => (
            <tr key={col}>
              <td className="font-medium text-[var(--muted-foreground)]">{col}</td>
              {rows.map((row, i) => (
                <td key={i}>{row[col] == null || row[col] === "" ? "—" : String(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
