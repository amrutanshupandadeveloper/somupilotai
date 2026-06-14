import { useState, useEffect } from "react";
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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const response = await notesService.getNotes(params);
      setNotes(response.data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchQuery]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      await notesService.createNote({
        ...formData,
        tags: tagsArray,
      });
      setShowModal(false);
      setFormData({ title: "", content: "", tags: "", isPinned: false });
      fetchNotes();
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      await notesService.updateNote(editingNote._id, {
        ...formData,
        tags: tagsArray,
      });
      setShowModal(false);
      setEditingNote(null);
      setFormData({ title: "", content: "", tags: "", isPinned: false });
      fetchNotes();
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleDeleteNote = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    try {
      await notesService.deleteNote(deleteConfirm);
      setDeleteConfirm(null);
      fetchNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
      isPinned: note.isPinned,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({ title: "", content: "", tags: "", isPinned: false });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        subtitle="Capture and organize your thoughts"
        actions={<Button onClick={() => setShowModal(true)}>New Note</Button>}
      />

      <SectionCard>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
        />
      </SectionCard>

      {loading ? (
        <ListSkeleton count={6} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Create your first note to get started"
          action={<Button onClick={() => setShowModal(true)}>Create Note</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note._id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {note.title}
                </h3>
                {note.isPinned && (
                  <Badge variant="info">Pinned</Badge>
                )}
              </div>
              <p className="text-sm text-slate-300 line-clamp-3 mb-4">
                {note.content}
              </p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="default" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-slate-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick(note)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteNote(note._id)}>
                    Delete
                  </Button>
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
              {editingNote ? "Edit Note" : "New Note"}
            </h2>
            <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="space-y-4">
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
                  placeholder="Note title"
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
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none resize-none"
                  placeholder="Note content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-white/10 bg-slate-950/50 text-sky-400 focus:ring-sky-400/50"
                />
                <label htmlFor="isPinned" className="text-sm text-slate-300">
                  Pin note
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={handleModalClose} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">
                  {editingNote ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
