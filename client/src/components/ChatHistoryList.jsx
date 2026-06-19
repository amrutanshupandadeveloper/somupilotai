import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ChatHistoryItem from "./ChatHistoryItem";

function ChatHistoryList({
  conversations,
  activeConversationId,
  onSelect,
  onPin,
  onUnpin,
  onDelete,
  onRename,
}) {
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const [showPinned, setShowPinned] = useState(true);
  const [showRecents, setShowRecents] = useState(true);

  const pinnedConversations = safeConversations
    .filter((c) => c.isPinned)
    .sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));

  const recentConversations = safeConversations
    .filter((c) => !c.isPinned)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="space-y-3">
      {pinnedConversations.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPinned((current) => !current)}
            className="group mb-2 inline-flex w-auto items-center gap-1.5 px-2 text-left"
            aria-label={showPinned ? "Collapse pinned" : "Expand pinned"}
          >
            <span className="text-glow-soft text-[14px] font-bold text-[var(--text)]">
              Pinned
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 transition-all duration-150 group-hover:opacity-100 ${
                showPinned ? "" : "-rotate-90"
              }`}
              strokeWidth={2}
            />
          </button>
          {showPinned ? (
            <div className="space-y-1">
              {pinnedConversations.map((conversation) => (
                <ChatHistoryItem
                  key={conversation._id}
                  conversation={conversation}
                  isActive={conversation._id === activeConversationId}
                  showLeadingIcon
                  onSelect={onSelect}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  onDelete={onDelete}
                  onRename={onRename}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {recentConversations.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowRecents((current) => !current)}
            className="group mb-2 inline-flex w-auto items-center gap-1.5 px-2 text-left"
            aria-label={showRecents ? "Collapse recents" : "Expand recents"}
          >
            <span className="text-glow-soft text-[14px] font-bold text-[var(--text)]">
              Recents
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 transition-all duration-150 group-hover:opacity-100 ${
                showRecents ? "" : "-rotate-90"
              }`}
              strokeWidth={2}
            />
          </button>
          {showRecents ? (
            <div className="space-y-1">
              {recentConversations.map((conversation) => (
                <ChatHistoryItem
                  key={conversation._id}
                  conversation={conversation}
                  isActive={conversation._id === activeConversationId}
                  onSelect={onSelect}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  onDelete={onDelete}
                  onRename={onRename}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {safeConversations.length === 0 && (
        <p className="px-2 text-sm text-[var(--text-muted)]">
          No conversations yet
        </p>
      )}
    </div>
  );
}

export default ChatHistoryList;
