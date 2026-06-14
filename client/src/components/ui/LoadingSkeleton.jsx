export function LoadingSkeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{
        animation: "shimmer 2.2s linear infinite",
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <LoadingSkeleton className="h-4 w-1/3 mb-4 rounded" />
      <LoadingSkeleton className="h-3 w-full mb-2 rounded" />
      <LoadingSkeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
