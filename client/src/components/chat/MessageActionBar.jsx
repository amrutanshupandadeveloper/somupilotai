import { Copy, Expand, PencilLine } from "lucide-react";

function MessageActionBar({
  onEdit,
  onCopy,
  onFullscreen,
  className = "",
}) {
  const iconButtonClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[var(--text-muted)] opacity-80 transition duration-200 hover:-translate-y-1 hover:bg-white/5 hover:text-[var(--text)] hover:opacity-100 active:translate-y-0";

  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 text-xs font-medium text-[var(--text)] transition duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:bg-white/8"
        aria-label="Edit assistant response"
        title="Edit"
      >
        <PencilLine className="h-3.5 w-3.5" />
        <span>Edit</span>
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onCopy}
          className={iconButtonClass}
          aria-label="Copy assistant response"
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onFullscreen}
          className={iconButtonClass}
          aria-label="Open response in fullscreen"
          title="Fullscreen"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default MessageActionBar;
