function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
      <span className="relative flex h-5 w-5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-50" />
        <span className="relative inline-flex h-5 w-5 rounded-full bg-brand-500" />
      </span>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}

export default LoadingState;
