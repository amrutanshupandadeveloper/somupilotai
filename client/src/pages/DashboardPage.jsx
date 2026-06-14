import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { notesService } from "../services/notesService";
import { tasksService } from "../services/tasksService";
import { memoryService } from "../services/memoryService";
import { documentService } from "../services/documentService";
import * as chatService from "../services/chatService";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { SectionCard } from "../components/ui/SectionCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import {
  ListSkeleton,
  LoadingSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
} from "../components/ui/LoadingSkeleton";
import UserTopBarActions from "../components/UserTopBarActions";

const quickActions = [
  {
    title: "New Chat",
    description: "Ask SomuPilot anything and continue your latest work thread.",
    to: "/chat",
  },
  {
    title: "Add Note",
    description: "Capture an idea, concept, or research point in seconds.",
    to: "/notes",
  },
  {
    title: "Add Task",
    description: "Turn plans into trackable action items with priorities.",
    to: "/tasks",
  },
  {
    title: "Upload PDF",
    description: "Bring a document in and ask questions from its content.",
    to: "/documents",
  },
];

function DashboardPage() {
  const { setTopBarConfig, resetTopBarConfig } = useOutletContext();
  const { user, usage, usageCountdown } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    recentNotes: [],
    pendingTasks: [],
    recentMemories: [],
    recentDocuments: [],
    recentConversations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          notesResponse,
          tasksResponse,
          memoriesResponse,
          documentsResponse,
          conversationsResponse,
        ] = await Promise.all([
          notesService.getNotes(),
          tasksService.getTasks(),
          memoryService.getMemories(),
          documentService.getDocuments(),
          chatService.getConversations(),
        ]);

        const allTasks = tasksResponse.data || [];

        setDashboardData({
          recentNotes: (notesResponse.data || []).slice(0, 4),
          pendingTasks: allTasks.filter((task) => task.status === "pending").slice(0, 4),
          recentMemories: (memoriesResponse.data || []).slice(0, 4),
          recentDocuments: (documentsResponse.data || []).slice(0, 4),
          recentConversations: (conversationsResponse.data || []).slice(0, 4),
          totalNotes: (notesResponse.data || []).length,
          totalTasks: allTasks.length,
          totalMemories: (memoriesResponse.data || []).length,
          totalDocuments: (documentsResponse.data || []).length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    setTopBarConfig({
      title: `Welcome back, ${user?.name || "there"}`,
      subtitle: "SomuPilot AI",
      showUsage: false,
      rightSlot: (
        <UserTopBarActions
          usage={usage}
          primaryActionLabel="Open chat"
          onPrimaryAction={() => navigate("/chat")}
        />
      ),
    });

    return () => resetTopBarConfig();
  }, [navigate, usage, user?.name]);

  return (
    <div className="space-y-8">
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title={`Welcome back, ${user?.name || "there"}`}
          subtitle="Your SomuPilot AI command center gives you one calm place to chat, organize work, and keep personal context close at hand."
        />
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <div className="app-gradient-border app-card rounded-[32px] p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              {loading ? (
                <div className="space-y-3">
                  <LoadingSkeleton className="h-3 w-28 rounded-full" />
                  <LoadingSkeleton className="h-10 w-full max-w-xl rounded-2xl" />
                  <LoadingSkeleton className="h-4 w-full max-w-2xl rounded-xl" />
                  <LoadingSkeleton className="h-4 w-5/6 max-w-xl rounded-xl" />
                </div>
              ) : (
                <>
                  <p className="app-kicker">Command Center</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--text)]">
                    Everything you need for focused AI-assisted work.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    Start a new conversation, capture ideas, upload a document, or move
                    through today's tasks without leaving your workspace.
                  </p>
                </>
              )}
            </div>
            {loading ? (
              <LoadingSkeleton className="h-12 w-32 rounded-2xl" />
            ) : (
              <Link to="/chat">
                <Button size="lg">Open chat</Button>
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[26px] border border-[var(--border)] bg-white/5 p-4"
                  >
                    <LoadingSkeleton className="h-5 w-28 rounded-xl" />
                    <LoadingSkeleton className="mt-3 h-4 w-full rounded-xl" />
                    <LoadingSkeleton className="mt-2 h-4 w-5/6 rounded-xl" />
                  </div>
                ))
              : quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="rounded-[26px] border border-[var(--border)] bg-white/5 p-4 transition hover:border-[var(--border-strong)] hover:bg-white/8"
                  >
                    <p className="text-base font-semibold text-[var(--text)]">{action.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                      {action.description}
                    </p>
                  </Link>
                ))}
          </div>
        </div>

        <SectionCard title="Usage snapshot">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <LoadingSkeleton className="h-4 w-24 rounded-xl" />
                    <LoadingSkeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <LoadingSkeleton className="h-2 w-full rounded-full" />
                  <LoadingSkeleton className="h-3 w-24 rounded-xl" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text)]">AI credits</p>
                    <Badge
                      variant={
                        usage?.aiCredits <= 0
                          ? "danger"
                          : usage?.aiCredits <= 5
                            ? "warning"
                            : "success"
                      }
                    >
                      {usage?.aiCredits || 0}/{usage?.maxAiCredits || 0}
                    </Badge>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full ${
                        (usage?.aiCredits || 0) <= 0
                          ? "bg-rose-400"
                          : (usage?.aiCredits || 0) <= 5
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((usage?.aiCredits || 0) / Math.max(usage?.maxAiCredits || 1, 1)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">Renews in {usageCountdown}</p>
                </>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {loading ? (
                <>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                    <LoadingSkeleton className="h-4 w-28 rounded-xl" />
                    <LoadingSkeleton className="mt-3 h-8 w-16 rounded-2xl" />
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                    <LoadingSkeleton className="h-4 w-28 rounded-xl" />
                    <LoadingSkeleton className="mt-3 h-8 w-20 rounded-2xl" />
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                    <p className="text-sm text-[var(--text-muted)]">Document credits</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text)]">
                      {usage?.documentCredits || 0}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4">
                    <p className="text-sm text-[var(--text-muted)]">PDF uploads today</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text)]">
                      {usage?.pdfUploadsToday || 0}/{usage?.maxPdfUploadsPerDay || 0}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </SectionCard>
      </section>

      {loading ? (
        <StatGridSkeleton count={6} />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="AI Credits"
            value={usage?.aiCredits || 0}
            subtitle={`Renews in ${usageCountdown}`}
            icon="AI"
          />
          <StatCard
            title="Document Credits"
            value={usage?.documentCredits || 0}
            subtitle={`PDF uploads ${usage?.pdfUploadsToday || 0}/${usage?.maxPdfUploadsPerDay || 0}`}
            icon="PDF"
          />
          <StatCard
            title="Notes"
            value={dashboardData.totalNotes || 0}
            subtitle="Captured knowledge"
            icon="NOTE"
          />
          <StatCard
            title="Tasks"
            value={dashboardData.totalTasks || 0}
            subtitle="Tracked work items"
            icon="TASK"
          />
          <StatCard
            title="Memories"
            value={dashboardData.totalMemories || 0}
            subtitle="Personal context saved"
            icon="MEM"
          />
          <StatCard
            title="Documents"
            value={dashboardData.totalDocuments || 0}
            subtitle="Uploaded references"
            icon="DOC"
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Recent conversations"
          actions={
            <Link to="/chat">
              <Button variant="secondary" size="sm">
                Open chat
              </Button>
            </Link>
          }
        >
          {loading ? (
            <ListSkeleton count={3} />
          ) : dashboardData.recentConversations.length === 0 ? (
            <EmptyState
              icon="S"
              title="No conversations yet"
              description="Start your first chat and your recent threads will show up here."
              action={
                <Link to="/chat">
                  <Button size="sm">Start chatting</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {dashboardData.recentConversations.map((conversation) => (
                <Link
                  key={conversation._id}
                  to="/chat"
                  className="block rounded-[24px] border border-[var(--border)] bg-white/5 p-4 transition hover:border-[var(--border-strong)] hover:bg-white/8"
                >
                  <p className="truncate text-sm font-semibold text-[var(--text)]">
                    {conversation.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-muted)]">
                    {conversation.lastMessagePreview || "No messages yet"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Pending tasks"
          actions={
            <Link to="/tasks">
              <Button variant="secondary" size="sm">
                View all
              </Button>
            </Link>
          }
        >
          {loading ? (
            <ListSkeleton count={3} />
          ) : dashboardData.pendingTasks.length === 0 ? (
            <EmptyState
              icon="T"
              title="No pending tasks"
              description="You're all caught up. Create a task to plan your next move."
            />
          ) : (
            <div className="space-y-3">
              {dashboardData.pendingTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text)]">
                        {task.title}
                      </p>
                      {task.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                          {task.description}
                        </p>
                      ) : null}
                    </div>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "danger"
                          : task.priority === "medium"
                            ? "warning"
                            : "success"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent notes"
          actions={
            <Link to="/notes">
              <Button variant="secondary" size="sm">
                View all
              </Button>
            </Link>
          }
        >
          {loading ? (
            <ListSkeleton count={3} />
          ) : dashboardData.recentNotes.length === 0 ? (
            <EmptyState
              icon="N"
              title="No notes saved yet"
              description="Capture your first note and it will show up here."
            />
          ) : (
            <div className="space-y-3">
              {dashboardData.recentNotes.map((note) => (
                <div
                  key={note._id}
                  className="rounded-[24px] border border-[var(--border)] bg-white/5 p-4"
                >
                  <p className="truncate text-sm font-semibold text-[var(--text)]">{note.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </div>
  );
}

export default DashboardPage;
