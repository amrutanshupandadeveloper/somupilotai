import { useEffect, useState } from "react";
import { Check, Copy, Minimize2, PencilLine, X } from "lucide-react";
import AssistantMessageRenderer from "../AssistantMessageRenderer";

function MessageFullscreenModal({
  isOpen,
  content,
  onClose,
  onSave,
}) {
  const [editValue, setEditValue] = useState(content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setEditValue(content || "");
    setIsEditing(false);

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [content, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editValue || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue) {
      return;
    }

    onSave?.(trimmedValue);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/82 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Assistant response fullscreen"
    >
      <div
        className="flex h-[min(92vh,960px)] w-full max-w-5xl origin-center flex-col overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_30px_120px_rgba(0,0,0,0.55)] animate-[menu-pop_180ms_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Response</p>
            <p className="text-xs text-[var(--text-muted)]">Assistant message viewer</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing((current) => !current)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 text-xs font-medium text-[var(--text)] transition hover:bg-white/10"
              aria-label="Edit response"
            >
              <PencilLine className="h-3.5 w-3.5" />
              <span>{isEditing ? "Preview" : "Edit"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 text-xs font-medium text-[var(--text)] transition hover:bg-white/10"
              aria-label="Copy response"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-[var(--text)] transition hover:bg-white/10"
              aria-label="Close fullscreen response"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                rows={18}
                className="min-h-[55vh] w-full resize-none rounded-[24px] border border-[var(--border)] bg-black/20 px-4 py-3 text-sm leading-7 text-[var(--text)] outline-none transition focus:border-[var(--border-strong)]"
                aria-label="Edit assistant response"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditValue(content || "");
                    setIsEditing(false);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-4 text-sm text-[var(--text)] transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-slate-950 transition hover:brightness-105"
                >
                  <Check className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[26px] border border-[var(--border)] bg-white/5 px-4 py-4 sm:px-5">
              <AssistantMessageRenderer content={editValue} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageFullscreenModal;
