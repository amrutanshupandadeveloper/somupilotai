import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center py-12 sm:py-16">
      <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
        <div>
          <p className="app-kicker">SomuPilot AI</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl">
            A premium personal AI assistant workspace for chat, planning, memory, and documents.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
            SomuPilot keeps your conversations, notes, tasks, memories, and PDF Q&A in one
            calm command center built for focused daily work.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to={isAuthenticated ? "/chat" : "/register"}>
              <Button size="lg">
                {isAuthenticated ? `Continue as ${user?.name}` : "Create your workspace"}
              </Button>
            </Link>
            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              <Button size="lg" variant="secondary">
                {isAuthenticated ? "Open dashboard" : "Sign in"}
              </Button>
            </Link>
          </div>
        </div>

        <div className="app-gradient-border app-card rounded-[36px] p-6 sm:p-7">
          <div className="rounded-[28px] border border-[var(--border)] bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">SomuPilot Chat</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">How can SomuPilot help today?</p>
              </div>
              <div className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs text-emerald-300">
                Ready
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["You", "Plan my study day for 4 hours with breaks."],
                [
                  "SomuPilot",
                  "I can create a focused study plan, break it into tasks, and help you track progress.",
                ],
                ["You", "Summarize my notes and turn them into revision tasks."],
              ].map(([speaker, message], index) => (
                <div
                  key={`${speaker}-${index}`}
                  className={`rounded-3xl px-4 py-3 text-sm leading-7 ${
                    speaker === "You"
                      ? "ml-auto max-w-[80%] bg-[var(--accent)] text-slate-950"
                      : "max-w-[88%] border border-[var(--border)] bg-white/5 text-[var(--text-soft)]"
                  }`}
                >
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-70">
                    {speaker}
                  </p>
                  {message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
