import { useAuth } from "../hooks/useAuth";

const dashboardCards = [
  {
    title: "AI Chat Ready",
    description: "Open the Chat workspace to start conversations with SomuPilot and keep history saved.",
  },
  {
    title: "Notes Coming Soon",
    description: "Capture ideas, prompts, and references in a dedicated notes space.",
  },
  {
    title: "Tasks Coming Soon",
    description: "Organize your work queue with task planning and progress tracking.",
  },
  {
    title: "Credits Coming Soon",
    description: "Usage summaries and credit controls will be introduced in a later phase.",
  },
];

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(15,23,42,0.9))] p-6 shadow-glow sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-200">Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Welcome, {user?.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/90">
          Your secure SomuPilot AI workspace is ready. This phase focuses on
          authentication, protected routes, and a clean dashboard foundation.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">{card.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default DashboardPage;
