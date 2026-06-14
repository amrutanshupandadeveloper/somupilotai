import { useEffect, useMemo, useState } from "react";
import { tasksService } from "../services/tasksService";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      const response = await tasksService.getTasks(params);
      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const groupedTasks = useMemo(
    () => ({
      pending: tasks.filter((task) => task.status === "pending"),
      completed: tasks.filter((task) => task.status === "completed"),
    }),
    [tasks]
  );

  const resetForm = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: "", description: "", dueDate: "", priority: "medium" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingTask?._id) {
        await tasksService.updateTask(editingTask._id, formData);
      } else {
        await tasksService.createTask(formData);
      }

      resetForm();
      await fetchTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task.priority,
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await tasksService.deleteTask(deleteConfirm);
      setDeleteConfirm(null);
      await fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const renderTaskCard = (task) => (
    <article key={task._id} className="app-card rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate text-base font-semibold ${
              task.status === "completed" ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"
            }`}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-muted)]">
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

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <Badge variant={task.status === "completed" ? "success" : "default"}>{task.status}</Badge>
        {task.dueDate ? <span>Due {new Date(task.dueDate).toLocaleDateString()}</span> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
        {task.status === "pending" ? (
          <Button size="sm" variant="secondary" onClick={() => tasksService.completeTask(task._id).then(fetchTasks)}>
            Complete
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => tasksService.reopenTask(task._id).then(fetchTasks)}>
            Reopen
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => handleEditClick(task)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(task._id)}>
          Delete
        </Button>
      </div>
    </article>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Plan work clearly, track progress, and keep priorities visible throughout the day."
        actions={<Button onClick={() => setShowModal(true)}>Add task</Button>}
      />

      <SectionCard>
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="app-input"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="app-input"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </div>
      </SectionCard>

      {loading ? (
        <ListSkeleton count={6} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="T"
          title="No tasks yet"
          description="Create your first task and keep your next actions visible."
          action={<Button onClick={() => setShowModal(true)}>Create task</Button>}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title={`Pending (${groupedTasks.pending.length})`}>
            {groupedTasks.pending.length === 0 ? (
              <EmptyState
                icon="P"
                title="No pending tasks"
                description="Everything is complete for now."
              />
            ) : (
              <div className="space-y-4">{groupedTasks.pending.map(renderTaskCard)}</div>
            )}
          </SectionCard>

          <SectionCard title={`Completed (${groupedTasks.completed.length})`}>
            {groupedTasks.completed.length === 0 ? (
              <EmptyState
                icon="C"
                title="No completed tasks yet"
                description="Completed work will collect here."
              />
            ) : (
              <div className="space-y-4">{groupedTasks.completed.map(renderTaskCard)}</div>
            )}
          </SectionCard>
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
          <div className="app-card w-full max-w-2xl rounded-[32px] p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="app-kicker">Tasks</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  {editingTask ? "Edit task" : "Create task"}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Close
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                className="app-input"
                placeholder="Task title"
              />
              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) =>
                  setFormData({ ...formData, description: event.target.value })
                }
                className="app-input min-h-[140px] resize-none"
                placeholder="Add more context or a checklist summary"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
                  className="app-input"
                />
                <select
                  value={formData.priority}
                  onChange={(event) => setFormData({ ...formData, priority: event.target.value })}
                  className="app-input"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>
                  Cancel
                </Button>
                <Button className="flex-1">{editingTask ? "Update task" : "Save task"}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default TasksPage;
