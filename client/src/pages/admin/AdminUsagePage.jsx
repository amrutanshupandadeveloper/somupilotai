import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { getAdminUsage } from "../../services/adminService";
import { LoadingSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "../../components/ui/LoadingSkeleton";

function AdminUsagePage() {
  const [usageData, setUsageData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        setLoading(true);
        const response = await getAdminUsage();
        setUsageData(response.data);
        setError("");
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load usage overview.");
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, []);

  return (
    <div className="space-y-8">
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title="Admin Usage"
          subtitle="Track low-credit users, upload pressure, and reset windows."
          actions={
            <Link to="/admin/users">
              <Button>Manage Credits</Button>
            </Link>
          }
        />
      )}

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <StatGridSkeleton count={3} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Tracked Users" value={usageData?.items?.length ?? "--"} icon="USR" />
          <StatCard title="Low AI Credits" value={usageData?.lowAiCreditUsers?.length ?? "--"} icon="LOW" />
          <StatCard title="Zero AI Credits" value={usageData?.zeroAiCreditUsers?.length ?? "--"} icon="ZER" />
        </div>
      )}

      <SectionCard title="Low Credit Users">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-3"
              >
                <div className="space-y-2">
                  <LoadingSkeleton className="h-4 w-28 rounded-xl" />
                  <LoadingSkeleton className="h-3 w-36 rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <LoadingSkeleton className="h-5 w-20 rounded-full" />
                  <LoadingSkeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            ))
          ) : usageData?.lowAiCreditUsers?.length ? (
            usageData.lowAiCreditUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={user.usage?.aiCredits === 0 ? "danger" : "warning"}>
                    AI {user.usage?.aiCredits}/{user.usage?.maxAiCredits}
                  </Badge>
                  <Badge variant="info">
                    Docs {user.usage?.documentCredits}/{user.usage?.maxDocumentCredits}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No users are running low on AI credits.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Upload Usage">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-3"
              >
                <div className="space-y-2">
                  <LoadingSkeleton className="h-4 w-28 rounded-xl" />
                  <LoadingSkeleton className="h-3 w-36 rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <LoadingSkeleton className="h-5 w-20 rounded-full" />
                  <LoadingSkeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            ))
          ) : usageData?.items?.length ? (
            usageData.items.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  <Badge variant="info">
                    PDF {user.usage?.pdfUploadsToday}/{user.usage?.maxPdfUploadsPerDay}
                  </Badge>
                  <span>Pictures {user.usage?.pictureUploadsToday}/{user.usage?.maxPictureUploadsPerDay}</span>
                  <span>Videos {user.usage?.videoUploadsToday}/{user.usage?.maxVideoUploadsPerDay}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No usage records found yet.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export default AdminUsagePage;
