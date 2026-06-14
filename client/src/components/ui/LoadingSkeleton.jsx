export function LoadingSkeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-2xl ${className}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full max-w-2xl space-y-3">
        <LoadingSkeleton className="h-3 w-28 rounded-full" />
        <LoadingSkeleton className="h-9 w-72 rounded-2xl" />
        <LoadingSkeleton className="h-4 w-full max-w-xl rounded-xl" />
      </div>
      <LoadingSkeleton className="h-11 w-36 rounded-2xl" />
    </div>
  );
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

export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card rounded-[28px] p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full space-y-3">
              <LoadingSkeleton className="h-4 w-24 rounded-xl" />
              <LoadingSkeleton className="h-9 w-20 rounded-2xl" />
              <LoadingSkeleton className="h-3 w-28 rounded-xl" />
            </div>
            <LoadingSkeleton className="h-10 w-10 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DirectorySkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card rounded-[28px] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <LoadingSkeleton className="h-5 w-36 rounded-xl" />
                <LoadingSkeleton className="h-5 w-16 rounded-full" />
                <LoadingSkeleton className="h-5 w-20 rounded-full" />
              </div>
              <LoadingSkeleton className="mt-3 h-4 w-56 rounded-xl" />
              <div className="mt-4 flex flex-wrap gap-3">
                <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                <LoadingSkeleton className="h-3 w-40 rounded-xl" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LoadingSkeleton className="h-10 w-28 rounded-2xl" />
              <LoadingSkeleton className="h-10 w-28 rounded-2xl" />
              <LoadingSkeleton className="h-10 w-24 rounded-2xl" />
              <LoadingSkeleton className="h-10 w-28 rounded-2xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuditLogSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card rounded-[28px] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <LoadingSkeleton className="h-4 w-36 rounded-xl" />
            <LoadingSkeleton className="h-5 w-20 rounded-full" />
          </div>
          <LoadingSkeleton className="mt-3 h-3 w-52 rounded-xl" />
          <LoadingSkeleton className="mt-2 h-3 w-40 rounded-xl" />
          <div className="mt-4 rounded-2xl border border-[var(--border)] p-3">
            <LoadingSkeleton className="h-3 w-full rounded-xl" />
            <LoadingSkeleton className="mt-2 h-3 w-11/12 rounded-xl" />
            <LoadingSkeleton className="mt-2 h-3 w-4/5 rounded-xl" />
          </div>
          <LoadingSkeleton className="mt-4 h-3 w-32 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
