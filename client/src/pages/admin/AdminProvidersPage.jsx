import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { Badge } from "../../components/ui/Badge";
import { getAdminAiStatus } from "../../services/adminService";
import { LoadingSkeleton, PageHeaderSkeleton } from "../../components/ui/LoadingSkeleton";

function AdminProvidersPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        const response = await getAdminAiStatus();
        setStatus(response.data);
        setError("");
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load provider status.");
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  return (
    <div className="space-y-8">
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title="Admin Providers"
          subtitle="Inspect provider readiness and fallback mode without exposing API keys."
        />
      )}

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <SectionCard title="Provider Mode">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
              <LoadingSkeleton className="h-3 w-20 rounded-xl" />
              <LoadingSkeleton className="mt-3 h-7 w-24 rounded-2xl" />
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
              <LoadingSkeleton className="h-3 w-24 rounded-xl" />
              <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Current mode</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{status?.aiProvider || "auto"}</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Fallback order</p>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                {status?.fallbackProviders?.join(" -> ") || "Not configured"}
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Provider Cards">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-[var(--border)] bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <LoadingSkeleton className="h-4 w-20 rounded-xl" />
                    <LoadingSkeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl" />
                  <LoadingSkeleton className="mt-2 h-3 w-5/6 rounded-xl" />
                </div>
              ))
            : status?.providers
              ? Object.entries(status.providers).map(([provider, details]) => (
                  <div
                    key={provider}
                    className="rounded-3xl border border-[var(--border)] bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text)]">{provider}</p>
                      <Badge
                        variant={details.local ? "info" : details.configured ? "success" : "warning"}
                      >
                        {details.local ? "Local" : details.configured ? "Configured" : "Missing"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-[var(--text-muted)]">Model: {details.model || "Not set"}</p>
                    {details.baseUrl ? (
                      <p className="mt-2 break-all text-xs text-[var(--text-muted)]">
                        Endpoint: {details.baseUrl}
                      </p>
                    ) : null}
                  </div>
                ))
              : null}
        </div>
      </SectionCard>
    </div>
  );
}

export default AdminProvidersPage;
