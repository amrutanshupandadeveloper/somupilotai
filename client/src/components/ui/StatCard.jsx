export function StatCard({ title, value, subtitle, icon, trend, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <p className={`mt-2 text-xs ${trend.positive ? "text-green-400" : "text-red-400"}`}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
}
