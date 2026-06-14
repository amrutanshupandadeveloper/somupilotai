import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <header
        className="sticky top-0 z-30 border-b border-[var(--border)] backdrop-blur-xl"
        style={{ backgroundColor: "var(--surface-glass)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link to="/" className="min-w-0">
            <p className="app-kicker">SomuPilot AI</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Personal AI assistant workspace
            </p>
          </Link>

          <nav className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={(event) => toggleTheme(event)}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </Button>
            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              <Button variant="secondary" size="sm">
                {isAuthenticated ? "Open app" : "Login"}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
