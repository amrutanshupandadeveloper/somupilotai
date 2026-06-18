import { Copy, Expand, PencilLine } from "lucide-react";

function MessageActionBar({
  onEdit,
  onCopy,
  onFullscreen,
  className = "",
}) {
  const iconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-[var(--text-muted)] transition duration-150 hover:scale-[1.02] hover:bg-white/10 hover:text-[var(--text)] active:scale-[0.98]";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl ${className}`}
    >
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 text-xs font-medium text-[var(--text)] transition duration-150 hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
        aria-label="Edit assistant response"
        title="Edit"
      >
        <PencilLine className="h-3.5 w-3.5" />
        <span>Edit</span>
      </button>

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
  );
}

export default MessageActionBar;
