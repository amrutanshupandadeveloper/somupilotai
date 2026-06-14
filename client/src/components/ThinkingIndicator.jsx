function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] text-xs font-semibold text-[var(--text)]"
        style={{ backgroundColor: "var(--surface-elevated)" }}
      >
        S
      </div>
      <div
        className="rounded-[28px] border border-[var(--border)] px-5 py-4 text-sm leading-7 text-[var(--text-soft)]"
        style={{ backgroundColor: "var(--surface-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <span>SomuPilot is thinking</span>
          <div className="flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThinkingIndicator;
