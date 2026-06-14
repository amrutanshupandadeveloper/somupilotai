import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/Button";
import { CreditBadge } from "./ui/CreditBadge";
import SidebarNavItem from "./SidebarNavItem";
import MoreMenu from "./MoreMenu";
import ChatHistoryList from "./ChatHistoryList";
import AccountSection from "./AccountSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import RenameConversationModal from "./RenameConversationModal";
import {
  getConversations,
  deleteConversation,
  updateConversationTitle,
  toggleConversationPin,
} from "../services/chatService";

const SIDEBAR_COLLAPSED_KEY = "somupilot_sidebar_collapsed";

const DashboardIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 10a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zm10-10a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V6zm0 14a2 2 0 012-2h4"
    />
  </svg>
);

const ChatIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.281-3.843A7.486 7.486 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const NotesIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5h6m-6 4h6m-6 4h4m-7 7h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const TasksIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0m-6 9l2 2 4-4"
    />
  </svg>
);

const MoreIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

const NewChatIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CollapseIcon = ({ collapsed }) => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" strokeWidth="1.7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M8.5 4.5v15" />
    {collapsed ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 12h5m-2-2 2 2-2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M17 12h-5m2-2-2 2 2 2" />
    )}
  </svg>
);

const primaryNavItems = [
  { label: "Dashboard", to: "/dashboard", hint: "Overview", icon: DashboardIcon },
  { label: "Chat", to: "/chat", hint: "Assistant", icon: ChatIcon },
  { label: "Notes", to: "/notes", hint: "Knowledge", icon: NotesIcon },
  { label: "Tasks", to: "/tasks", hint: "Planner", icon: TasksIcon },
];

const readStoredCollapsedState = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
};

function AppSidebar({ isOpen, onClose, user, usage, usageCountdown, onLogout, onNewChat }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [conversationToRename, setConversationToRename] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isCollapsed, setIsCollapsed] = useState(readStoredCollapsedState);
  const location = useLocation();

  const refreshConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
    }
  };

  const isRailMode = isDesktop && isCollapsed;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleConversationRefresh = () => {
      refreshConversations();
    };

    refreshConversations();
    window.addEventListener("somupilot:conversations-updated", handleConversationRefresh);

    return () => {
      window.removeEventListener("somupilot:conversations-updated", handleConversationRefresh);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params.get("conversationId");
    setActiveConversationId(conversationId);
  }, [location]);

  const handlePin = async (id) => {
    try {
      await toggleConversationPin(id);
      await refreshConversations();
    } catch (error) {
      console.error("Failed to pin conversation:", error);
    }
  };

  const handleUnpin = async (id) => {
    try {
      await toggleConversationPin(id);
      await refreshConversations();
    } catch (error) {
      console.error("Failed to unpin conversation:", error);
    }
  };

  const handleDelete = (conversation) => {
    setConversationToDelete(conversation);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) {
      return;
    }

    try {
      await deleteConversation(conversationToDelete._id);
      await refreshConversations();
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleRename = (conversation) => {
    setConversationToRename(conversation);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = async (newTitle) => {
    if (!conversationToRename) {
      return;
    }

    try {
      await updateConversationTitle(conversationToRename._id, newTitle);
      await refreshConversations();
      setRenameModalOpen(false);
      setConversationToRename(null);
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    }
  };

  const sidebarWidthClass = useMemo(() => {
    if (isRailMode) {
      return "w-[280px] lg:w-[84px]";
    }

    return "w-[280px] lg:w-[288px]";
  }, [isRailMode]);

  const collapseButtonClass =
    "flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] text-slate-300 transition-all duration-150 hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] ${sidebarWidthClass} flex-col overflow-hidden border-r border-[var(--border)] bg-[color:var(--sidebar)] backdrop-blur-xl transition-[width,transform] duration-200 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="shrink-0 border-b border-[var(--border)] bg-[color:var(--sidebar)]">
        <div className={`flex items-start ${isRailMode ? "justify-center px-3 py-4" : "justify-between px-4 py-4"}`}>
          {isRailMode ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className={`${collapseButtonClass} h-10 w-10`}
            >
              <CollapseIcon collapsed />
            </button>
          ) : (
            <>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <svg className="h-6 w-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <h1 className="truncate text-lg font-semibold text-[var(--text)]">SomuPilot AI</h1>
                </div>
                <p className="ml-8 text-xs text-[var(--text-muted)]">Personal Agent</p>
              </div>

              {isDesktop ? (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className={`${collapseButtonClass} h-10 w-10`}
                >
                  <CollapseIcon collapsed={false} />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className={`${isRailMode ? "px-3 py-4" : "px-4 py-4"}`}>
          {isRailMode ? (
            <button
              type="button"
              onClick={onNewChat}
              aria-label="New Chat"
              title="New Chat"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)]/80"
            >
              {NewChatIcon}
            </button>
          ) : (
            <Button className="mb-6 w-full" onClick={onNewChat}>
              {NewChatIcon}
              New Chat
            </Button>
          )}

          {!isRailMode && usage ? (
            <div
              className="mb-6 rounded-xl border border-[var(--border)] p-3"
              style={{ backgroundColor: "var(--surface-elevated)" }}
            >
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
                icon={item.icon}
                collapsed={isRailMode}
                onClick={onClose}
              />
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu((current) => !current)}
                aria-label="More"
                title="More"
                className={`w-full rounded-xl text-left transition-all ${
                  isRailMode
                    ? "flex h-12 items-center justify-center border border-transparent text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                    : "flex items-center justify-between px-3 py-2.5 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                {isRailMode ? (
                  MoreIcon
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {MoreIcon}
                      <span className="text-sm font-medium">More</span>
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform ${showMoreMenu ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>

              <MoreMenu
                isOpen={showMoreMenu}
                onClose={() => setShowMoreMenu(false)}
                user={user}
                collapsed={isRailMode}
              />
            </div>
          </nav>

          {!isRailMode ? (
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
          ) : (
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand recent chats"
                title="Recent Chats"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-[var(--text-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--text)]"
              >
                {ChatIcon}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`shrink-0 border-t border-[var(--border)] bg-[color:var(--sidebar)] ${
          isRailMode ? "px-3 pb-5 pt-4" : "px-4 pb-5 pt-4"
        }`}
      >
        <AccountSection user={user} onLogout={onLogout} collapsed={isRailMode} />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] lg:hidden"
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
