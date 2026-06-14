export function Badge({ variant = "default", children, className = "" }) {
  const variants = {
    default: "border border-[var(--border)] bg-white/5 text-[var(--text-muted)]",
    success: "border border-emerald-400/20 bg-emerald-500/12 text-emerald-300",
    warning: "border border-amber-400/20 bg-amber-500/12 text-amber-300",
    danger: "border border-rose-400/20 bg-rose-500/12 text-rose-300",
    info: "border border-cyan-400/20 bg-cyan-500/12 text-cyan-300",
    purple: "border border-violet-400/20 bg-violet-500/12 text-violet-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
