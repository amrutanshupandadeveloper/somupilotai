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
    <div className="space-y-4">
      {pinnedConversations.length > 0 && (
        <div>
          <p className="px-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
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
          <p className="px-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
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
        <p className="px-3 text-sm text-[var(--text-muted)]">
          No conversations yet
        </p>
      )}
    </div>
  );
}

export default ChatHistoryList;
