export function StatCard({ title, value, subtitle, icon, trend, className = "" }) {
  return (
    <div className={`app-card rounded-[28px] p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{value}</p>
          {subtitle && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`mt-3 text-xs ${
                trend.positive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        {icon ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-[var(--text-soft)]">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
