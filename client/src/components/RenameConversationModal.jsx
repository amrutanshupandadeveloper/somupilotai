import { useState, useEffect } from "react";

function RenameConversationModal({ isOpen, onClose, onConfirm, initialTitle = "" }) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
    }
  }, [isOpen, initialTitle]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onConfirm(title.trim());
      setTitle("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-[var(--text)]">Rename Conversation</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter new title"
          maxLength={120}
          className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          autoFocus
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default RenameConversationModal;
