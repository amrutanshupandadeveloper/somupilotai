import SourceSkeleton from "./SourceSkeleton";

function ThinkingIndicator({ status = "thinking", sourcesLoading = false, webSearchEnabled = false }) {
  const normalizedStatus = String(status || "thinking").trim();
  const labelMap = {
    thinking: "Thinking...",
    searching_web: "Searching web...",
    reading_sources: "Reading sources...",
    writing_answer: "Writing answer...",
  };

  return (
    <div
      className="max-w-[760px] rounded-[28px] border border-[var(--border)] px-5 py-4 text-sm leading-7 text-[var(--text-soft)]"
      style={{ backgroundColor: "var(--surface-elevated)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[var(--text-soft)]">{labelMap[normalizedStatus] || "Thinking..."}</span>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full skeleton-shimmer"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 rounded-full skeleton-shimmer"
            style={{ animationDelay: "180ms" }}
          />
          <span
            className="h-2 w-2 rounded-full skeleton-shimmer"
            style={{ animationDelay: "360ms" }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3.5 w-48 rounded-full bg-white/6" />
          <div className="skeleton-shimmer h-3.5 w-full rounded-full bg-white/6" />
          <div className="skeleton-shimmer h-3.5 w-5/6 rounded-full bg-white/6" />
        </div>

        {webSearchEnabled || sourcesLoading ? (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {normalizedStatus === "searching_web" ? "Searching live sources" : "Source scan"}
            </p>
            <SourceSkeleton />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ThinkingIndicator;
