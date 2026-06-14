import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUsageToneClasses } from "../utils/usage";
import { notesService } from "../services/notesService";
import { tasksService } from "../services/tasksService";
import { memoryService } from "../services/memoryService";
import { documentService } from "../services/documentService";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { SectionCard } from "../components/ui/SectionCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/LoadingSkeleton";

function DashboardPage() {
  const { user, usage, usageCountdown } = useAuth();
  const [recentNotes, setRecentNotes] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [recentMemories, setRecentMemories] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [notesResponse, tasksResponse, memoriesResponse, documentsResponse] = await Promise.all([
        notesService.getNotes(),
        tasksService.getTasks({ status: "pending" }),
        memoryService.getMemories(),
        documentService.getDocuments(),
      ]);
      setRecentNotes(notesResponse.data.slice(0, 3));
      setPendingTasks(tasksResponse.data.slice(0, 3));
      setRecentMemories(memoriesResponse.data.slice(0, 3));
      setRecentDocuments(documentsResponse.data.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name || "User"}`}
        subtitle="Your secure SomuPilot AI workspace is ready."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="AI Credits"
          value={usage?.aiCredits || 0}
          subtitle={`Renews in ${usageCountdown}`}
          icon="💬"
          trend={usage?.aiCredits > 5 ? { value: "Available", positive: true } : null}
        />
        <StatCard
          title="Document Credits"
          value={usage?.documentCredits || 0}
          subtitle="For PDF Q&A"
          icon="📄"
        />
        <StatCard
          title="Notes"
          value={recentNotes.length}
          subtitle="Total notes"
          icon="📝"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          subtitle="To complete"
          icon="✅"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Recent Notes" actions={<Link to="/notes"><Button variant="secondary" size="sm">View All</Button></Link>}>
          {loading ? (
            <ListSkeleton count={3} />
          ) : recentNotes.length === 0 ? (
            <EmptyState icon="📝" title="No notes yet" description="Create your first note to get started" action={<Link to="/notes"><Button size="sm">Create Note</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note._id} className="rounded-xl border border-white/5 bg-slate-950/50 p-4 hover:border-white/10 transition">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{note.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Pending Tasks" actions={<Link to="/tasks"><Button variant="secondary" size="sm">View All</Button></Link>}>
          {loading ? (
            <ListSkeleton count={3} />
          ) : pendingTasks.length === 0 ? (
            <EmptyState icon="✅" title="No pending tasks" description="All caught up! Create a new task" action={<Link to="/tasks"><Button size="sm">Add Task</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task._id} className="rounded-xl border border-white/5 bg-slate-950/50 p-4 hover:border-white/10 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white line-clamp-1">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && <span className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Saved Memories" actions={<Link to="/memories"><Button variant="secondary" size="sm">View All</Button></Link>}>
          {loading ? (
            <ListSkeleton count={3} />
          ) : recentMemories.length === 0 ? (
            <EmptyState icon="🧠" title="No memories yet" description="Save important information for SomuPilot to remember" action={<Link to="/memories"><Button size="sm">Add Memory</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {recentMemories.map((memory) => (
                <div key={memory._id} className="rounded-xl border border-white/5 bg-slate-950/50 p-4 hover:border-white/10 transition">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{memory.title}</h3>
                  <Badge variant="purple" className="mt-2">{memory.category}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Documents" actions={<Link to="/documents"><Button variant="secondary" size="sm">View All</Button></Link>}>
          {loading ? (
            <ListSkeleton count={3} />
          ) : recentDocuments.length === 0 ? (
            <EmptyState icon="📄" title="No documents yet" description="Upload PDFs to ask questions from them" action={<Link to="/documents"><Button size="sm">Upload PDF</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc._id} className="rounded-xl border border-white/5 bg-slate-950/50 p-4 hover:border-white/10 transition">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{doc.originalName}</h3>
                  <Badge variant="success" className="mt-2">{doc.chunksCount} chunks</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      <SectionCard title="Quick Actions">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/chat" className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 transition hover:border-sky-400/50 hover:bg-white/5">
            <span className="text-lg">💬</span>
            <span>New Chat</span>
          </Link>
          <Link to="/notes" className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 transition hover:border-sky-400/50 hover:bg-white/5">
            <span className="text-lg">📝</span>
            <span>Add Note</span>
          </Link>
          <Link to="/tasks" className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 transition hover:border-sky-400/50 hover:bg-white/5">
            <span className="text-lg">✅</span>
            <span>Add Task</span>
          </Link>
          <Link to="/documents" className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 transition hover:border-sky-400/50 hover:bg-white/5">
            <span className="text-lg">📄</span>
            <span>Upload PDF</span>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

export default DashboardPage;
