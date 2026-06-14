import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import UsageBadge from "../components/UsageBadge";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Chat", to: "/chat" },
  { label: "Notes", to: "/notes" },
  { label: "Tasks", to: "/tasks" },
  { label: "Memories", to: "/memories" },
  { label: "Documents", to: "/documents" },
  { label: "Settings", to: "/dashboard" },
];

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, usage, usageCountdown } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/95 p-6 backdrop-blur transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-300">
                SomuPilot AI
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-white">Workspace</h1>
              <p className="mt-2 text-sm text-slate-400">
                Personal AI Agent Dashboard
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              Close
            </button>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-sky-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  Menu
                </button>
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.name || "SomuPilot User"}
                  </p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UsageBadge usage={usage} countdown={usageCountdown} />
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-300/40 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {isSidebarOpen ? (
            <button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          ) : null}

          <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
