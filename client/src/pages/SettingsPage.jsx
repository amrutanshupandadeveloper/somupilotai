import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { getAiProviderStatus } from "../services/aiService";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ConfirmModal } from "../components/ui/ConfirmModal";

const formatProviderLabel = (provider) =>
  provider === "openrouter"
    ? "OpenRouter"
    : provider === "ollama"
      ? "Ollama"
      : provider.charAt(0).toUpperCase() + provider.slice(1);

function SettingsPage() {
  const { user, usage, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [providerStatus, setProviderStatus] = useState(null);
  const [providerError, setProviderError] = useState("");

  useEffect(() => {
    const loadProviderStatus = async () => {
      try {
        const response = await getAiProviderStatus();
        setProviderStatus(response.data);
        setProviderError("");
      } catch (error) {
        setProviderError(
          error.response?.data?.message || "Unable to load AI provider status right now."
        );
      }
    };

    loadProviderStatus();
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, theme, AI provider visibility, and daily limits."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionCard title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Name</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">{user?.name || "-"}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Email</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">{user?.email || "-"}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Role</p>
              <div className="mt-3">
                <Badge variant="info">{user?.role || "user"}</Badge>
              </div>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Theme</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={theme === "dark" ? "primary" : "secondary"}
                  onClick={(event) => setTheme("dark", event)}
                >
                  <span aria-hidden="true">{"\u263E"}</span>
                  Dark
                </Button>
                <Button
                  size="sm"
                  variant={theme === "light" ? "primary" : "secondary"}
                  onClick={(event) => setTheme("light", event)}
                >
                  <span aria-hidden="true">{"\u2600"}</span>
                  Light
                </Button>
                <Button size="sm" variant="ghost" onClick={(event) => toggleTheme(event)}>
                  <span aria-hidden="true">{theme === "dark" ? "\u2600" : "\u263E"}</span>
                  Toggle
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="App info">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-sm font-semibold text-[var(--text)]">SomuPilot AI</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                Personal AI agent dashboard with chat, notes, tasks, memories, and document Q&A.
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-sm font-semibold text-[var(--text)]">Current theme</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {theme === "dark" ? "Dark mode enabled" : "Light mode enabled"}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="AI Provider Status">
        <div className="space-y-5">
          {providerError ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {providerError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Current mode</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">
                {providerStatus?.mode === "auto"
                  ? "Auto fallback"
                  : formatProviderLabel(providerStatus?.mode || "auto")}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Fallback order</p>
              <p className="mt-3 text-sm text-[var(--text-soft)]">
                {providerStatus?.fallbackOrder?.length
                  ? providerStatus.fallbackOrder.map(formatProviderLabel).join(" -> ")
                  : "Not available"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {providerStatus?.providers
              ? Object.entries(providerStatus.providers).map(([provider, details]) => (
                  <div
                    key={provider}
                    className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {formatProviderLabel(provider)}
                      </p>
                      <Badge
                        variant={
                          details.local ? "info" : details.configured ? "success" : "warning"
                        }
                      >
                        {details.local
                          ? "Local"
                          : details.configured
                            ? "Configured"
                            : "Not configured"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-[var(--text-muted)]">
                      Model: {details.model || "Not set"}
                    </p>
                    {details.local ? (
                      <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">
                        Endpoint: {details.baseUrl}
                      </p>
                    ) : null}
                  </div>
                ))
              : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Credit Limits">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="AI Credits"
            value={usage?.aiCredits || 0}
            subtitle={`Max ${usage?.maxAiCredits || 0}`}
            icon="AI"
          />
          <StatCard
            title="Document Credits"
            value={usage?.documentCredits || 0}
            subtitle={`Max ${usage?.maxDocumentCredits || 0}`}
            icon="PDF"
          />
          <StatCard
            title="PDF Uploads"
            value={usage?.pdfUploadsToday || 0}
            subtitle={`Max ${usage?.maxPdfUploadsPerDay || 0} daily`}
            icon="UP"
          />
          <StatCard
            title="Pictures"
            value={usage?.pictureUploadsToday || 0}
            subtitle={`Max ${usage?.maxPictureUploadsPerDay || 0} daily`}
            icon="IMG"
          />
          <StatCard
            title="Videos"
            value={usage?.videoUploadsToday || 0}
            subtitle={`Max ${usage?.maxVideoUploadsPerDay || 0} daily`}
            icon="VID"
          />
        </div>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <div className="rounded-[24px] border border-rose-400/18 bg-rose-500/8 p-4">
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            Logging out only ends your current session on this device.
          </p>
          <Button variant="danger" className="mt-4" onClick={() => setShowLogoutModal(true)}>
            Logout
          </Button>
        </div>
      </SectionCard>

      {showLogoutModal ? (
        <ConfirmModal
          isOpen={showLogoutModal}
          title="Logout"
          message="Are you sure you want to logout? You will need to sign in again to access your workspace."
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      ) : null}
    </div>
  );
}

export default SettingsPage;
