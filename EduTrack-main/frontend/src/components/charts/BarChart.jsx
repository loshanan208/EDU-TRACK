function BarChart({ data, valueKey = "value", labelKey = "label", colorClass = "bg-brand-600" }) {
  const maxValue = Math.max(1, ...data.map((item) => Number(item[valueKey] || 0)));

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        const width = `${Math.max(4, (value / maxValue) * 100)}%`;

        return (
          <div key={item[labelKey]}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>{item[labelKey]}</span>
              <span>{value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className={`h-3 rounded-full ${colorClass}`} style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;
