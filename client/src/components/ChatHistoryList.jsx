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
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Pinned
          </p>
          <div className="space-y-1">
            {pinnedConversations.map((conversation) => (
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
        </div>
      )}

      {recentConversations.length > 0 && (
        <div>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Recent Chats
          </p>
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
