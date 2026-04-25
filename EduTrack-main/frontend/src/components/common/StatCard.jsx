const VARIANTS = {
  default:  { bar: "bg-gradient-to-r from-brand-500 to-brand-600",   bg: "bg-brand-50",   icon: "text-brand-600" },
  violet:   { bar: "bg-gradient-to-r from-violet-500 to-indigo-600",  bg: "bg-violet-50",  icon: "text-violet-600" },
  sky:      { bar: "bg-gradient-to-r from-sky-500 to-cyan-500",       bg: "bg-sky-50",     icon: "text-sky-600" },
  emerald:  { bar: "bg-gradient-to-r from-emerald-500 to-teal-500",   bg: "bg-emerald-50", icon: "text-emerald-600" },
  rose:     { bar: "bg-gradient-to-r from-rose-500 to-pink-500",      bg: "bg-rose-50",    icon: "text-rose-600" },
  amber:    { bar: "bg-gradient-to-r from-amber-400 to-orange-500",   bg: "bg-amber-50",   icon: "text-amber-600" },
};

function StatCard({ label, value, hint, variant = "default", icon }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-card-md">
      {/* Top accent bar */}
      <div className={`absolute left-0 top-0 h-1 w-full ${v.bar}`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tabular-nums">{value ?? "—"}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${v.bg}`}>
            <svg className={`h-5 w-5 ${v.icon}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
