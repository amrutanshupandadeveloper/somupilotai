import UsageBadge from "./UsageBadge";
import { Button } from "./ui/Button";

function TopBar({ title, user, usage, usageCountdown, theme, onToggleTheme, onMenuOpen }) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)] backdrop-blur-xl"
      style={{ backgroundColor: "var(--surface-glass)" }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] px-4 text-sm text-[var(--text)] lg:hidden"
            onClick={onMenuOpen}
            aria-label="Open sidebar"
          >
            Menu
          </button>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Signed in as {user?.name || "SomuPilot User"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <UsageBadge usage={usage} countdown={usageCountdown} />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={(event) => onToggleTheme(event)}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
