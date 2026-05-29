function escapeCsvCell(cell: string): string {
  if (cell.includes('"') || cell.includes(",") || cell.includes("\n")) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function downloadCsv(filename: string, rows: string[][]) {
  const body = rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\n");
  const blob = new Blob(["\uFEFF", body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printTableAsPdf(title: string, headers: string[], rows: string[][]) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${title.replace(/</g, "&lt;")}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; color: #1c1917; }
    h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    p { font-size: 0.75rem; color: #78716c; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
    th, td { border: 1px solid #e7e5e4; padding: 0.5rem 0.625rem; text-align: left; }
    th { background: #fafaf9; font-weight: 600; }
    tr:nth-child(even) td { background: #fafaf9; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title.replace(/</g, "&lt;")}</h1>
  <p>FranchiseHub · ${new Date().toLocaleString("tr-TR")}</p>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h.replace(/</g, "&lt;")}</th>`).join("")}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.onload = () => {
    win.print();
    win.close();
  };
}
