import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { getAdminAiStatus, getAdminStats } from "../../services/adminService";
import { LoadingSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "../../components/ui/LoadingSkeleton";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsResponse, providerResponse] = await Promise.all([
          getAdminStats(),
          getAdminAiStatus(),
        ]);
        setStats(statsResponse.data);
        setProviders(providerResponse.data);
        setError("");
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title="Admin Dashboard"
          subtitle="Monitor users, provider health, and product usage from a secure control surface."
          actions={
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/users">
                <Button variant="secondary">Manage Users</Button>
              </Link>
              <Link to="/admin/providers">
                <Button>Providers</Button>
              </Link>
            </div>
          }
        />
      )}

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <StatGridSkeleton count={8} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? "--"} icon="USR" />
        <StatCard title="Active Users" value={stats?.activeUsers ?? "--"} icon="ACT" />
        <StatCard title="Conversations" value={stats?.totalConversations ?? "--"} icon="CHT" />
        <StatCard title="AI Answers" value={stats?.totalAiCreditsUsed ?? "--"} icon="AI" />
        <StatCard title="Notes" value={stats?.totalNotes ?? "--"} icon="NTS" />
        <StatCard title="Tasks" value={stats?.totalTasks ?? "--"} icon="TSK" />
        <StatCard title="Memories" value={stats?.totalMemories ?? "--"} icon="MEM" />
        <StatCard title="Documents" value={stats?.totalDocuments ?? "--"} icon="PDF" />
      </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SectionCard title="Recent Users">
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-3"
                >
                  <div className="space-y-2">
                    <LoadingSkeleton className="h-4 w-32 rounded-xl" />
                    <LoadingSkeleton className="h-3 w-40 rounded-xl" />
                  </div>
                  <div className="flex gap-2">
                    <LoadingSkeleton className="h-5 w-16 rounded-full" />
                    <LoadingSkeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))
            ) : stats?.recentUsers?.length ? (
              stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={user.role === "admin" ? "purple" : "info"}>{user.role}</Badge>
                    <Badge variant={user.status === "active" ? "success" : "danger"}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No users found yet.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Provider Summary">
          <div className="space-y-4">
            {loading ? (
              <>
                <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
                  <LoadingSkeleton className="h-3 w-16 rounded-xl" />
                  <LoadingSkeleton className="mt-3 h-7 w-24 rounded-2xl" />
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
                  <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                  <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3"
                    >
                      <LoadingSkeleton className="h-4 w-20 rounded-xl" />
                      <LoadingSkeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Mode</p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--text)]">
                    {providers?.aiProvider || "auto"}
                  </p>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Fallback order</p>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    {providers?.fallbackProviders?.join(" -> ") || "Not configured"}
                  </p>
                </div>
                <div className="space-y-2">
                  {providers?.providers
                    ? Object.entries(providers.providers).map(([provider, config]) => (
                        <div
                          key={provider}
                          className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3"
                        >
                          <span className="text-sm font-medium text-[var(--text)]">{provider}</span>
                          <Badge
                            variant={config.local ? "info" : config.configured ? "success" : "warning"}
                          >
                            {config.local ? "Local" : config.configured ? "Configured" : "Missing"}
                          </Badge>
                        </div>
                      ))
                    : null}
                </div>
              </>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
