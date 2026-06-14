import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

function AccountSection({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  const initials = (user?.name || "SP")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return (
    <div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-[var(--hover)]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-sm font-semibold text-[var(--text)]">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="truncate text-sm font-medium text-[var(--text)]">{user?.name}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
          </div>
          <svg
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
              showMenu ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
            {user?.role === "admin" ? (
              <NavLink
                to="/admin/dashboard"
                onClick={() => setShowMenu(false)}
                className="block px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)]"
              >
                Admin Panel
              </NavLink>
            ) : null}
            <NavLink
              to="/settings"
              onClick={() => setShowMenu(false)}
              className="block px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)]"
            >
              Profile / Settings
            </NavLink>
            <div className="my-1 border-t border-[var(--border)]" />
            <button
              onClick={() => {
                onLogout();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountSection;
