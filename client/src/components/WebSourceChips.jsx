function WebSourceChips({ sources = [] }) {
  const visibleSources = sources.slice(0, 3);
  const remainingCount = Math.max(0, sources.length - visibleSources.length);

  if (!visibleSources.length) {
    return null;
  }

  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
      {visibleSources.map((source) => (
        <a
          key={`${source.url}-${source.title}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-w-0 max-w-[220px] items-center gap-2 rounded-full border border-[var(--border)] bg-[#111111] px-3 py-2 text-xs text-[var(--text-soft)] transition hover:border-teal-400/35 hover:bg-white/5 dark:bg-[#111111] light:bg-white"
          title={source.title || source.domain}
        >
          {source.faviconUrl ? (
            <img src={source.faviconUrl} alt="" className="h-4 w-4 rounded-full" />
          ) : (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/8 text-[9px] font-semibold uppercase text-[var(--text-muted)]">
              {(source.domain || source.title || "W").charAt(0)}
            </span>
          )}
          <span className="truncate">
            {source.domain || source.title || "Source"}
          </span>
        </a>
      ))}

      {remainingCount > 0 ? (
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-white/5 px-3 py-2 text-xs text-[var(--text-muted)]">
          +{remainingCount} more
        </span>
      ) : null}
    </div>
  );
}

export default WebSourceChips;
