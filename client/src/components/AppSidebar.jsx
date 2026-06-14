import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/Button";
import { CreditBadge } from "./ui/CreditBadge";
import SidebarNavItem from "./SidebarNavItem";
import MoreMenu from "./MoreMenu";
import ChatHistoryList from "./ChatHistoryList";
import AccountSection from "./AccountSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import RenameConversationModal from "./RenameConversationModal";
import { getConversations, deleteConversation, updateConversationTitle, toggleConversationPin } from "../services/chatService";

const primaryNavItems = [
  { label: "Dashboard", to: "/dashboard", hint: "Overview" },
  { label: "Chat", to: "/chat", hint: "Assistant" },
  { label: "Notes", to: "/notes", hint: "Knowledge" },
  { label: "Tasks", to: "/tasks", hint: "Planner" },
];

function AppSidebar({
  isOpen,
  onClose,
  user,
  usage,
  usageCountdown,
  onLogout,
  onNewChat,
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [conversationToRename, setConversationToRename] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await getConversations();
        setConversations(response.data || []);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setConversations([]);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params.get("conversationId");
    setActiveConversationId(conversationId);
  }, [location]);

  const handlePin = async (id) => {
    try {
      await toggleConversationPin(id);
      const response = await getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to pin conversation:", error);
    }
  };

  const handleUnpin = async (id) => {
    try {
      await toggleConversationPin(id);
      const response = await getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to unpin conversation:", error);
    }
  };

  const handleDelete = (conversation) => {
    setConversationToDelete(conversation);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (conversationToDelete) {
      try {
        await deleteConversation(conversationToDelete._id);
        const response = await getConversations();
        setConversations(response.data || []);
        setDeleteModalOpen(false);
        setConversationToDelete(null);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  const handleRename = (conversation) => {
    setConversationToRename(conversation);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = async (newTitle) => {
    if (conversationToRename) {
      try {
        await updateConversationTitle(conversationToRename._id, newTitle);
        const response = await getConversations();
        setConversations(response.data || []);
        setRenameModalOpen(false);
        setConversationToRename(null);
      } catch (error) {
        console.error("Failed to rename conversation:", error);
      }
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[280px] flex-col overflow-hidden border-r border-[var(--border)] bg-[color:var(--sidebar)] backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:h-[100dvh] ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="shrink-0 border-b border-[var(--border)] bg-[color:var(--sidebar)]">
        <div className="px-4 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <h1 className="text-lg font-semibold text-[var(--text)]">SomuPilot AI</h1>
            </div>
            <p className="ml-8 text-xs text-[var(--text-muted)]">Personal Agent</p>
          </div>
        </div>
      </div>

      <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="px-4 py-4">
          <Button className="w-full mb-6" onClick={onNewChat}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </Button>

          {usage ? (
            <div className="mb-6 rounded-xl border border-[var(--border)] p-3" style={{ backgroundColor: "var(--surface-elevated)" }}>
              <CreditBadge
                credits={usage.aiCredits}
                maxCredits={usage.maxAiCredits}
                countdown={usageCountdown}
              />
            </div>
          ) : null}

          <nav className="space-y-1">
            {primaryNavItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                hint={item.hint}
                onClick={onClose}
              />
            ))}

            <div>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-sm font-medium">More</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${showMoreMenu ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <MoreMenu
                isOpen={showMoreMenu}
                onClose={() => setShowMoreMenu(false)}
                user={user}
              />
            </div>
          </nav>

          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <ChatHistoryList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={() => {}}
              onPin={handlePin}
              onUnpin={handleUnpin}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] bg-[color:var(--sidebar)] px-4 pb-5 pt-4">
        <div>
          <AccountSection user={user} onLogout={onLogout} />
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)]"
        aria-label="Close sidebar"
      >
        Close
      </button>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setConversationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <RenameConversationModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setConversationToRename(null);
        }}
        onConfirm={handleConfirmRename}
        initialTitle={conversationToRename?.title || ""}
      />
    </aside>
  );
}

export default AppSidebar;
