import { useState, useRef, useEffect } from "react";

function ChatItemActionMenu({ isOpen, onClose, onRename, onPin, onUnpin, onDelete, isPinned }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-2 top-8 z-50 min-w-[140px] rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
    >
      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--hover)]"
      >
        Rename
      </button>
      <button
        onClick={() => {
          if (isPinned) {
            onUnpin();
          } else {
            onPin();
          }
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--hover)]"
      >
        {isPinned ? "Unpin" : "Pin"}
      </button>
      <div className="my-1 border-t border-[var(--border)]" />
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
      >
        Delete
      </button>
    </div>
  );
}

export default ChatItemActionMenu;
