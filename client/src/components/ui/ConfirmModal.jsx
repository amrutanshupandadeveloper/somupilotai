export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
      <div className="app-card w-full max-w-md rounded-[30px] p-6">
        <h2 className="mb-2 text-xl font-semibold text-[var(--text)]">{title}</h2>
        <p className="mb-6 text-sm leading-7 text-[var(--text-muted)]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-105"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
