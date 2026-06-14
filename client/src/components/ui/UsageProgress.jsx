export function UsageProgress({ current, max, label, color = "sky" }) {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  const colors = {
    sky: "bg-[var(--accent)]",
    green: "bg-emerald-400",
    yellow: "bg-amber-400",
    red: "bg-rose-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-medium text-[var(--text)]">{current}/{max}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--surface-elevated)" }}
      >
        <div
          className={`h-full ${colors[color]} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
