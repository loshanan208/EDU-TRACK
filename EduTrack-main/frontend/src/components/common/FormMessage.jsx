const STYLES = {
  error:   { wrap: "border-rose-200 bg-rose-50 text-rose-700",     icon: "text-rose-500",   path: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  success: { wrap: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: "text-emerald-500", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  info:    { wrap: "border-blue-200 bg-blue-50 text-blue-700",       icon: "text-blue-500",   path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
};

function FormMessage({ type = "info", message }) {
  if (!message) return null;
  const s = STYLES[type] || STYLES.info;

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${s.wrap}`}>
      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export default FormMessage;
