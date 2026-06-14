import { useEffect, useState } from "react";
import { memoryService } from "../services/memoryService";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";

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

function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "preference",
  });

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const params = { isActive: true };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      const response = await memoryService.getMemories(params);
      setMemories(response.data || []);
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [searchQuery, categoryFilter]);

  const resetForm = () => {
    setShowModal(false);
    setEditingMemory(null);
    setFormData({ title: "", content: "", category: "preference" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingMemory?._id) {
        await memoryService.updateMemory(editingMemory._id, formData);
      } else {
        await memoryService.createMemory(formData);
      }

      resetForm();
      await fetchMemories();
    } catch (error) {
      console.error("Failed to save memory:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await memoryService.deleteMemory(deleteConfirm);
      setDeleteConfirm(null);
      await fetchMemories();
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memories"
        subtitle="Memories help SomuPilot personalize replies using preferences, goals, profile details, and recurring context you choose to save."
        actions={<Button onClick={() => setShowModal(true)}>Add memory</Button>}
      />

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <input
            type="text"
            placeholder="Search saved memories"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="app-input"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="app-input"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </SectionCard>

      {loading ? (
        <ListSkeleton count={6} />
      ) : memories.length === 0 ? (
        <EmptyState
          icon="M"
          title="No memories saved yet"
          description="Save something important and SomuPilot can use it in future replies."
          action={<Button onClick={() => setShowModal(true)}>Save memory</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {memories.map((memory) => (
            <article key={memory._id} className="app-card rounded-[28px] p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-[var(--text)]">
                    {memory.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Saved {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="purple">{memory.category}</Badge>
              </div>

              <p className="mt-4 line-clamp-4 text-sm leading-7 text-[var(--text-soft)]">
                {memory.content}
              </p>

              <div className="mt-5 flex gap-2 border-t border-[var(--border)] pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingMemory(memory);
                    setFormData({
                      title: memory.title,
                      content: memory.content,
                      category: memory.category,
                    });
                    setShowModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(memory._id)}>
                  Forget
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
          <div className="app-card w-full max-w-2xl rounded-[32px] p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="app-kicker">Memories</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  {editingMemory ? "Edit memory" : "Create memory"}
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
                placeholder="Memory title"
              />
              <textarea
                rows={5}
                required
                value={formData.content}
                onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                className="app-input min-h-[160px] resize-none"
                placeholder="What should SomuPilot remember?"
              />
              <select
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                className="app-input"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>
                  Cancel
                </Button>
                <Button className="flex-1">{editingMemory ? "Update memory" : "Save memory"}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Forget Memory"
        message="Are you sure you want to forget this memory? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default MemoriesPage;
