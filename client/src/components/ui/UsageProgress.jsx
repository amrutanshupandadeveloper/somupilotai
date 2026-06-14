export function UsageProgress({ current, max, label, color = "sky" }) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  const colors = {
    sky: "bg-sky-400",
    green: "bg-green-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{current}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${colors[color]} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
