import { useEffect, useState } from "react";
import { notesService } from "../services/notesService";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ListSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    isPinned: false,
  });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const params = searchQuery ? { search: searchQuery } : {};
        const response = await notesService.getNotes(params);
        setNotes(response.data || []);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [searchQuery]);

  const resetForm = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: "", content: "", tags: "", isPinned: false });
  };

  const refreshNotes = async () => {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await notesService.getNotes(params);
    setNotes(response.data || []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (editingNote?._id) {
        await notesService.updateNote(editingNote._id, payload);
      } else {
        await notesService.createNote(payload);
      }

      resetForm();
      await refreshNotes();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: (note.tags || []).join(", "),
      isPinned: note.isPinned,
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await notesService.deleteNote(deleteConfirm);
      setDeleteConfirm(null);
      await refreshNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        subtitle="Capture ideas, save reference snippets, and keep your working knowledge easy to revisit."
        actions={<Button onClick={() => setShowModal(true)}>Add note</Button>}
      />

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            type="text"
            placeholder="Search notes by title, content, or tags"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="app-input"
          />
          <div className="rounded-[24px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm text-[var(--text-muted)]">
            {notes.length} note{notes.length === 1 ? "" : "s"} found
          </div>
        </div>
      </SectionCard>

      {loading ? (
        <ListSkeleton count={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon="N"
          title="No notes yet"
          description="Create your first note to start building your personal knowledge base."
          action={<Button onClick={() => setShowModal(true)}>Create note</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {notes.map((note) => (
            <article key={note._id} className="app-card rounded-[28px] p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-[var(--text)]">{note.title}</h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {note.isPinned ? <Badge variant="info">Pinned</Badge> : null}
              </div>

              <p className="mt-4 line-clamp-4 text-sm leading-7 text-[var(--text-soft)]">
                {note.content}
              </p>

              {(note.tags || []).length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex items-center gap-2 border-t border-[var(--border)] pt-4">
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(note)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(note._id)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
          <div className="app-card w-full max-w-2xl rounded-[32px] p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="app-kicker">Notes</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  {editingNote ? "Edit note" : "Create note"}
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
                placeholder="Note title"
              />
              <textarea
                required
                rows={7}
                value={formData.content}
                onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                className="app-input min-h-[180px] resize-none"
                placeholder="Write your note..."
              />
              <input
                type="text"
                value={formData.tags}
                onChange={(event) => setFormData({ ...formData, tags: event.target.value })}
                className="app-input"
                placeholder="Tags, separated, by commas"
              />
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3 text-sm text-[var(--text-soft)]">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(event) =>
                    setFormData({ ...formData, isPinned: event.target.checked })
                  }
                />
                Pin this note
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>
                  Cancel
                </Button>
                <Button className="flex-1">{editingNote ? "Update note" : "Save note"}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default NotesPage;
