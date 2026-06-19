import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CircleEllipsis,
  PenSquare,
  LayoutGrid,
  MessageSquareText,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  SquareCheckBig,
} from "lucide-react";
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

const DashboardIcon = <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.9} />;
const ChatIcon = <MessageSquareText className="h-[18px] w-[18px]" strokeWidth={1.9} />;
const NotesIcon = <NotebookPen className="h-[18px] w-[18px]" strokeWidth={1.9} />;
const TasksIcon = <SquareCheckBig className="h-[18px] w-[18px]" strokeWidth={1.9} />;
const MoreIcon = <CircleEllipsis className="h-[18px] w-[18px]" strokeWidth={1.9} />;
const NewChatIcon = <PenSquare className="h-[19px] w-[19px]" strokeWidth={1.95} />;
const CollapseIcon = ({ collapsed }) =>
  collapsed ? (
    <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
  ) : (
    <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
  );

const primaryNavItems = [
  { label: "Dashboard", to: "/dashboard", hint: "Overview", icon: DashboardIcon },
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

  const isNewChatActive = location.pathname === "/chat" && !activeConversationId;

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
      return "w-[min(320px,88vw)] lg:w-[72px]";
    }

    return "w-[min(304px,84vw)] lg:w-[244px]";
  }, [isRailMode]);

  const collapseButtonClass =
    "flex items-center justify-center rounded-2xl border border-transparent bg-transparent text-slate-300 transition-all duration-150 hover:bg-[var(--hover)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] ${sidebarWidthClass} flex-col overflow-hidden border-r border-[var(--border)] bg-[color:var(--sidebar)] backdrop-blur-xl transition-[width,transform] duration-200 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="shrink-0 bg-[color:var(--sidebar)]">
        <div className={`flex items-start ${isRailMode ? "justify-center px-3 py-3.5" : "justify-between px-4 py-3.5"}`}>
          {isRailMode ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className={`${collapseButtonClass} h-10 w-10 rounded-xl`}
            >
              <CollapseIcon collapsed />
            </button>
          ) : (
            <>
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-2">
                  <svg className="h-6 w-6 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <h1 className="text-glow-soft truncate text-[18px] font-semibold text-[var(--text)]">SomuPilot AI</h1>
                </div>
                <p className="text-glow-muted ml-8 text-[11px] text-[var(--text-muted)]">Personal Agent</p>
              </div>

              {isDesktop ? (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className={`${collapseButtonClass} h-10 w-10 rounded-xl`}
                >
                  <CollapseIcon collapsed={false} />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className={`${isRailMode ? "px-3 py-3.5" : "px-4 py-3.5"}`}>
          {isRailMode ? (
            <button
              type="button"
              onClick={onNewChat}
              aria-label="New Chat"
              title="New Chat"
              className={`mb-1 flex h-11 w-11 items-center justify-center self-center rounded-xl border border-transparent transition ${
                isNewChatActive
                  ? "text-[var(--sidebar-active-text)]"
                  : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
              }`}
              style={isNewChatActive ? { backgroundColor: "var(--sidebar-active-bg)" } : undefined}
            >
              {NewChatIcon}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewChat}
              className={`mb-2.5 flex min-h-[42px] w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                isNewChatActive
                  ? "text-[var(--sidebar-active-text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
              }`}
              style={isNewChatActive ? { backgroundColor: "var(--sidebar-active-bg)" } : undefined}
            >
              <span
                className={`inline-flex h-[18px] w-[18px] items-center justify-center leading-none ${
                  isNewChatActive ? "text-[var(--sidebar-active-text)]" : ""
                }`}
              >
                {NewChatIcon}
              </span>
              <span
                className={`truncate text-[14px] font-medium leading-5 ${
                  isNewChatActive ? "" : "text-glow-soft text-[var(--text)]"
                }`}
                style={isNewChatActive ? { color: "var(--sidebar-active-text)" } : undefined}
              >
                New Chat
              </span>
            </button>
          )}

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
                    ? "flex h-11 items-center justify-center border border-transparent text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                    : "flex min-h-[44px] items-center justify-between px-3 py-2 text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                {isRailMode ? (
                  MoreIcon
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {MoreIcon}
                      <span className="text-glow-soft text-sm font-medium">More</span>
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
            <div className="mt-4 pt-1">
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
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-transparent bg-transparent text-[var(--text-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--text)]"
              >
                {ChatIcon}
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`shrink-0 border-t border-[var(--border)] bg-[color:var(--sidebar)] ${
          isRailMode ? "px-3 pb-4 pt-3.5" : "px-4 pb-4 pt-3.5"
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
