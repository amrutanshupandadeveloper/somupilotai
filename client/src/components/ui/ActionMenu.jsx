import { useState, useRef, useEffect } from "react";

export function ActionMenu({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-[var(--border)] p-1 shadow-xl backdrop-blur"
          style={{ backgroundColor: "var(--surface-glass)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function ActionMenuItem({ children, onClick, danger = false }) {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
        danger
          ? "text-red-300 hover:bg-red-400/10"
          : "text-[var(--text-soft)] hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
