function SourceSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="skeleton-shimmer h-9 min-w-[112px] rounded-full border border-[var(--border)] bg-white/5"
        />
      ))}
    </div>
  );
}

export default SourceSkeleton;
