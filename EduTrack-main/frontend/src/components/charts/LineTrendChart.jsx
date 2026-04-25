function LineTrendChart({ points, height = 180 }) {
  if (!points.length) {
    return <p className="text-sm text-slate-500">No trend data available.</p>;
  }

  const width = 500;
  const padding = 24;
  const values = points.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);

  const getX = (index) => {
    if (points.length === 1) return width / 2;
    return padding + (index * (width - padding * 2)) / (points.length - 1);
  };

  const getY = (value) => {
    if (max === min) return height / 2;
    return height - padding - ((value - min) * (height - padding * 2)) / (max - min);
  };

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${getX(index)},${getY(point.value)}`)
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 min-w-[480px] w-full">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" />
        <path d={path} fill="none" stroke="#0f79f4" strokeWidth="3" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={getX(index)} cy={getY(point.value)} r="4" fill="#15458d" />
            <text x={getX(index)} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default LineTrendChart;
