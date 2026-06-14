import { useState, useEffect } from "react";
import { memoryService } from "../services/memoryService";

function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "preference",
  });

  const categories = [
    "preference",
    "goal",
    "profile",
    "learning",
    "work",
    "project",
    "routine",
    "other",
  ];

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const params = { isActive: true };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== "all") params.category = categoryFilter;
      const response = await memoryService.getMemories(params);
      setMemories(response.data);
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [searchQuery, categoryFilter]);

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    try {
      await memoryService.createMemory(formData);
      setShowModal(false);
      setFormData({ title: "", content: "", category: "preference" });
      fetchMemories();
    } catch (error) {
      console.error("Failed to create memory:", error);
    }
  };

  const handleUpdateMemory = async (e) => {
    e.preventDefault();
    try {
      await memoryService.updateMemory(editingMemory._id, formData);
      setShowModal(false);
      setEditingMemory(null);
      setFormData({ title: "", content: "", category: "preference" });
      fetchMemories();
    } catch (error) {
      console.error("Failed to update memory:", error);
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm("Are you sure you want to forget this memory?")) return;
    try {
      await memoryService.deleteMemory(id);
      fetchMemories();
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  };

  const handleEditClick = (memory) => {
    setEditingMemory(memory);
    setFormData({
      title: memory.title,
      content: memory.content,
      category: memory.category,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMemory(null);
    setFormData({ title: "", content: "", category: "preference" });
  };

  const getCategoryColor = (category) => {
    const colors = {
      preference: "bg-sky-400/10 text-sky-300 border-sky-400/30",
      goal: "bg-green-400/10 text-green-300 border-green-400/30",
      profile: "bg-purple-400/10 text-purple-300 border-purple-400/30",
      learning: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
      work: "bg-blue-400/10 text-blue-300 border-blue-400/30",
      project: "bg-pink-400/10 text-pink-300 border-pink-400/30",
      routine: "bg-orange-400/10 text-orange-300 border-orange-400/30",
      other: "bg-slate-400/10 text-slate-300 border-slate-400/30",
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Memories</h1>
          <p className="mt-2 text-sm text-slate-400">
            Personal preferences and facts SomuPilot remembers about you
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-6 py-3 text-sm font-medium text-sky-300 transition hover:border-sky-400/50 hover:bg-sky-400/20"
        >
          New Memory
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
          />
        </div>
        <div className="w-48 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">Loading memories...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 py-12">
          <p className="text-lg font-medium text-white">No memories saved yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Ask SomuPilot to remember something about you
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <article
              key={memory._id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {memory.title}
                </h3>
                <span
                  className={`ml-2 rounded-full border px-3 py-1 text-xs font-medium ${getCategoryColor(
                    memory.category
                  )}`}
                >
                  {memory.category}
                </span>
              </div>
              <p className="text-sm text-slate-300 line-clamp-3 mb-4">
                {memory.content}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-slate-500">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(memory)}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMemory(memory._id)}
                    className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 transition"
                  >
                    Forget
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingMemory ? "Edit Memory" : "New Memory"}
            </h2>
            <form onSubmit={editingMemory ? handleUpdateMemory : handleCreateMemory} className="space-y-4">
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
                  placeholder="Memory title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none resize-none"
                  placeholder="Memory content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-sky-400/50 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
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
                  {editingMemory ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoriesPage;
