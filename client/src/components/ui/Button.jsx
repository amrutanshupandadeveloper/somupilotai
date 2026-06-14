export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-55";

  const variants = {
    primary:
      "bg-[var(--accent)] text-slate-950 shadow-[0_12px_30px_rgba(20,184,166,0.24)] hover:brightness-105",
    secondary:
      "border border-[var(--border)] bg-white/5 text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-white/10",
    danger:
      "border border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/40 hover:bg-red-500/16",
    ghost:
      "border border-transparent bg-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-white/5 hover:text-[var(--text)]",
  };

  const sizes = {
    sm: "min-h-9 px-3.5 py-2 text-sm",
    md: "min-h-11 px-4.5 py-2.5 text-sm",
    lg: "min-h-12 px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
