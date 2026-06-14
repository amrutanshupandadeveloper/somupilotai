import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  getAdminUsers,
  resetAdminUserCredits,
  updateAdminUserCredits,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminService";

const initialCreditForm = {
  aiCredits: "",
  maxAiCredits: "",
  documentCredits: "",
  maxDocumentCredits: "",
  resetIntervalHours: "",
  maxPdfUploadsPerDay: "",
};

function AdminUsersPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all", page: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [creditForm, setCreditForm] = useState(initialCreditForm);
  const [pendingResetUser, setPendingResetUser] = useState(null);

  const query = useMemo(
    () => ({
      page: filters.page,
      search: filters.search || undefined,
      role: filters.role !== "all" ? filters.role : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
    }),
    [filters]
  );

  const loadUsers = async () => {
    try {
      const response = await getAdminUsers(query);
      setResult(response.data);
      setError("");
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [query.page, query.role, query.search, query.status]);

  const openEditCredits = (user) => {
    setEditingUser(user);
    setCreditForm({
      aiCredits: user.usage?.aiCredits ?? "",
      maxAiCredits: user.usage?.maxAiCredits ?? "",
      documentCredits: user.usage?.documentCredits ?? "",
      maxDocumentCredits: user.usage?.maxDocumentCredits ?? "",
      resetIntervalHours: user.usage?.resetIntervalHours ?? "",
      maxPdfUploadsPerDay: user.usage?.maxPdfUploadsPerDay ?? "",
    });
  };

  const handleSaveCredits = async () => {
    if (!editingUser) {
      return;
    }

    await updateAdminUserCredits(editingUser.id, creditForm);
    setEditingUser(null);
    setCreditForm(initialCreditForm);
    await loadUsers();
  };

  const handleResetCredits = async () => {
    if (!pendingResetUser) {
      return;
    }

    await resetAdminUserCredits(pendingResetUser.id);
    setPendingResetUser(null);
    await loadUsers();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Users"
        subtitle="Search accounts, change roles, block access, and tune credit limits safely."
      />

      <SectionCard title="Search & Filters">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Search name or email"
            className="min-h-12 rounded-2xl border border-[var(--border)] bg-white/5 px-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          <select
            value={filters.role}
            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value, page: 1 }))}
            className="min-h-12 rounded-2xl border border-[var(--border)] bg-white/5 px-4 text-sm text-[var(--text)] outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
            className="min-h-12 rounded-2xl border border-[var(--border)] bg-white/5 px-4 text-sm text-[var(--text)] outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <Button onClick={loadUsers}>Refresh</Button>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <SectionCard title="User Directory">
        <div className="space-y-4">
          {result?.items?.length ? (
            result.items.map((user) => (
              <div key={user.id} className="rounded-3xl border border-[var(--border)] bg-white/5 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-[var(--text)]">{user.name}</p>
                      <Badge variant={user.role === "admin" ? "purple" : "info"}>{user.role}</Badge>
                      <Badge variant={user.status === "active" ? "success" : "danger"}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                      <span>AI {user.usage?.aiCredits ?? 0}/{user.usage?.maxAiCredits ?? 0}</span>
                      <span>Docs {user.usage?.documentCredits ?? 0}/{user.usage?.maxDocumentCredits ?? 0}</span>
                      <span>PDFs {user.usage?.pdfUploadsToday ?? 0}/{user.usage?.maxPdfUploadsPerDay ?? 0}</span>
                      <span>Last login {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditCredits(user)}>
                      Edit Credits
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await updateAdminUserRole(user.id, user.role === "admin" ? "user" : "admin");
                        await loadUsers();
                      }}
                    >
                      {user.role === "admin" ? "Make User" : "Make Admin"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await updateAdminUserStatus(user.id, user.status === "active" ? "blocked" : "active");
                        await loadUsers();
                      }}
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setPendingResetUser(user)}>
                      Reset Credits
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No users matched these filters.</p>
          )}
        </div>

        {result?.pagination ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
            <span>
              Page {result.pagination.page} of {result.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={result.pagination.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={result.pagination.page >= result.pagination.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
          <div className="app-card w-full max-w-2xl rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Edit Credits</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{editingUser.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setEditingUser(null)}>
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.entries(creditForm).map(([field, value]) => (
                <label key={field} className="space-y-2">
                  <span className="text-sm text-[var(--text-muted)]">{field}</span>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(event) =>
                      setCreditForm((current) => ({ ...current, [field]: event.target.value }))
                    }
                    className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCredits}>Save</Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(pendingResetUser)}
        title="Reset user credits"
        message={`Reset all credits and daily upload counters for ${pendingResetUser?.email || "this user"}?`}
        onConfirm={handleResetCredits}
        onCancel={() => setPendingResetUser(null)}
      />
    </div>
  );
}

export default AdminUsersPage;
