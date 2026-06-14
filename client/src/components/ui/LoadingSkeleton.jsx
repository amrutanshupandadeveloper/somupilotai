export function LoadingSkeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-2xl ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="app-card rounded-[28px] p-6">
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
