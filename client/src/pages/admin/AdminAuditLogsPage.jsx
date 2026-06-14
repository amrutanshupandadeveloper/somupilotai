import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  AuditLogSkeleton,
  PageHeaderSkeleton,
} from "../../components/ui/LoadingSkeleton";
import { getAdminAuditLogs } from "../../services/adminService";

function AdminAuditLogsPage() {
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const response = await getAdminAuditLogs({ page });
        setLogs(response.data);
        setError("");
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [page]);

  return (
    <div className="space-y-8">
      {loading && !logs ? (
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title="Admin Audit Logs"
          subtitle="Review sensitive admin actions like role changes, blocks, and credit resets."
        />
      )}

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <SectionCard title="Activity">
        {loading && !logs ? (
          <AuditLogSkeleton count={5} />
        ) : (
          <div className="space-y-3">
            {logs?.items?.length ? (
              logs.items.map((log) => (
                <div key={log.id} className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--text)]">{log.action}</p>
                    <Badge variant="info">{log.targetType}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Admin: {log.admin?.name || "Unknown"} ({log.admin?.email || "n/a"})
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Target ID: {log.targetId}</p>
                  <pre className="mt-3 overflow-x-auto rounded-2xl border border-[var(--border)] bg-black/20 p-3 text-xs text-[var(--text-muted)]">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No audit logs yet.</p>
            )}
          </div>
        )}

        {logs?.pagination ? (
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              disabled={page >= logs.pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}

export default AdminAuditLogsPage;
