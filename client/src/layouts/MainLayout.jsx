import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function MainLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
              SomuPilot AI
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Personal AI Agent Dashboard
            </p>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Home
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
