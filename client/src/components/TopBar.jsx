import UsageBadge from "./UsageBadge";
import { Button } from "./ui/Button";

function TopBar({
  title,
  subtitle,
  user,
  usage,
  usageCountdown,
  theme,
  themeMode,
  onToggleTheme,
  onMenuOpen,
  compact = false,
  showSignedIn = true,
  showUsage = true,
  showThemeToggle = true,
  rightSlot = null,
  showBorder = false,
}) {
  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ${
        showBorder ? "border-b border-[var(--border)]" : "border-b border-transparent"
      }`}
      style={{ backgroundColor: "var(--sidebar)" }}
    >
      <div
        className={`flex items-center justify-between gap-4 px-4 sm:px-6 xl:px-8 ${
          compact ? "min-h-[52px] py-2" : "min-h-[58px] py-2.5"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 px-3.5 text-sm text-[var(--text)] lg:hidden"
            onClick={onMenuOpen}
            aria-label="Open sidebar"
          >
            Menu
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-[var(--text)]">{title}</p>
            {subtitle ? (
              <p className="truncate text-[11px] leading-4 text-[var(--text-muted)]">{subtitle}</p>
            ) : showSignedIn ? (
              <p className="truncate text-[11px] leading-4 text-[var(--text-muted)]">
                Signed in as {user?.name || "SomuPilot User"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showUsage ? (
            <div className="hidden sm:block">
              <UsageBadge usage={usage} countdown={usageCountdown} />
            </div>
          ) : null}
          {rightSlot}
          {showThemeToggle ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(event) => onToggleTheme(event)}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode${themeMode === "system" ? " from system mode" : ""}`}
            >
              <span aria-hidden="true">{theme === "dark" ? "\u2600" : "\u263E"}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
