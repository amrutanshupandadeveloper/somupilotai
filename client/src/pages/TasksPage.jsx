import { useState, useEffect } from "react";
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
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      const response = await tasksService.getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksService.createTask(formData);
      setShowModal(false);
      setFormData({ title: "", description: "", dueDate: "", priority: "medium" });
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksService.updateTask(editingTask._id, formData);
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: "", description: "", dueDate: "", priority: "medium" });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    try {
      await tasksService.deleteTask(deleteConfirm);
      setDeleteConfirm(null);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await tasksService.completeTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleReopenTask = async (id) => {
    try {
      await tasksService.reopenTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Failed to reopen task:", error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task.priority,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: "", description: "", dueDate: "", priority: "medium" });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-400/10 text-red-300 border-red-400/30";
      case "medium":
        return "bg-yellow-400/10 text-yellow-300 border-yellow-400/30";
      case "low":
        return "bg-green-400/10 text-green-300 border-green-400/30";
      default:
        return "bg-slate-400/10 text-slate-300 border-slate-400/30";
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Tasks</h1>
          <p className="mt-2 text-sm text-slate-400">
            Organize and track your work
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-6 py-3 text-sm font-medium text-sky-300 transition hover:border-sky-400/50 hover:bg-sky-400/20"
        >
          New Task
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 py-12">
          <p className="text-lg font-medium text-white">No tasks yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Create your first task to get started
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Pending ({pendingTasks.length})
              </h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <article
                    key={task._id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-white/20 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-300 mt-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`ml-4 rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-slate-400 mb-4">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-slate-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCompleteTask(task._id)}
                          className="rounded-lg px-3 py-1.5 text-xs text-green-400 hover:bg-green-400/10 transition"
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditClick(task)}
                          className="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task._id)}
                          className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <article
                    key={task._id}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 opacity-60"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-300 line-through">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-slate-400 mt-2 line-through">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`ml-4 rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-slate-500">
                        Completed: {new Date(task.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReopenTask(task._id)}
                          className="rounded-lg px-3 py-1.5 text-xs text-sky-400 hover:bg-sky-400/10 transition"
                        >
                          Reopen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task._id)}
                          className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingTask ? "Edit Task" : "New Task"}
            </h2>
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none resize-none"
                  placeholder="Task description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-400 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-sky-400/90 transition"
                >
                  {editingTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
