import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur">
        <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200">
          Phase 1 Authentication
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          SomuPilot AI
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
          Personal AI Agent Dashboard
        </p>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400">
          Authentication and protected dashboard foundations are now in place, ready
          for upcoming AI, notes, task, memory, and document features.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
          >
            {isAuthenticated ? `Continue as ${user?.name}` : "Create account"}
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-3 font-medium text-slate-100 transition hover:border-sky-300/40 hover:bg-slate-900"
          >
            {isAuthenticated ? "Open dashboard" : "Sign in"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
