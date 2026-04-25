function DataTable({ columns, rows, keyField = "id" }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, i) => (
              <tr
                key={row[keyField] || row._id || i}
                className="transition-colors hover:bg-slate-50/70"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle text-slate-700">
                    {col.render ? col.render(row) : (row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
