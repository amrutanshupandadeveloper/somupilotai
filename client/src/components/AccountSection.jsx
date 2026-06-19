import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

function AccountSection({ user, onLogout, collapsed = false }) {
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
          aria-label={collapsed ? "Account menu" : undefined}
          title={collapsed ? "Account" : undefined}
          className={`rounded-xl transition-all hover:bg-[var(--hover)] ${
            collapsed
              ? "flex h-11 w-11 items-center justify-center"
              : "flex min-h-[62px] w-full items-center gap-3 px-3 py-2"
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-sm font-semibold text-[var(--text)]">
            {initials}
          </div>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-glow-soft truncate text-[14px] font-semibold text-[var(--text)]">{user?.name}</p>
                <p className="text-glow-muted truncate text-[11px] font-medium text-[var(--text-muted)]">{user?.email}</p>
              </div>
              <svg
                className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${
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
            </>
          ) : null}
        </button>

        {showMenu && (
          <div
            className={`absolute z-50 mb-2 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg ${
              collapsed ? "bottom-0 left-[calc(100%+12px)] w-56" : "bottom-full left-0 right-0"
            }`}
          >
            <div className="border-b border-[var(--border)] px-3 py-2">
              <p className="text-glow-soft truncate text-sm font-semibold text-[var(--text)]">{user?.name}</p>
              <p className="text-glow-muted truncate text-xs font-medium text-[var(--text-muted)]">{user?.email}</p>
            </div>
            {user?.role === "admin" ? (
              <NavLink
                to="/admin/dashboard"
                onClick={() => setShowMenu(false)}
                className="text-glow-soft block px-3 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
              >
                Admin Panel
              </NavLink>
            ) : null}
            <NavLink
              to="/settings"
              onClick={() => setShowMenu(false)}
              className="text-glow-soft block px-3 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
            >
              Profile / Settings
            </NavLink>
            <div className="my-1 border-t border-[var(--border)]" />
            <button
              onClick={() => {
                onLogout();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-semibold text-red-400 hover:bg-red-500/10"
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
