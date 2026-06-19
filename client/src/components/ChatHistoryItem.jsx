import { useState } from "react";
import { MessageCircle, MoreHorizontal, Pin, PinOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatItemActionMenu from "./ChatItemActionMenu";

function ChatHistoryItem({
  conversation,
  isActive,
  onSelect,
  onPin,
  onUnpin,
  onDelete,
  onRename,
  showLeadingIcon = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    onSelect(conversation._id);
    navigate(`/chat?conversationId=${conversation._id}`);
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    if (conversation.isPinned) {
      onUnpin(conversation._id);
    } else {
      onPin(conversation._id);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative group">
      <div
        className={`flex min-h-[42px] w-full items-center gap-2 rounded-2xl px-3 py-2 transition-all ${
          isActive
            ? "text-[var(--sidebar-active-text)]"
            : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
        }`}
        style={isActive ? { backgroundColor: "var(--sidebar-active-bg)" } : undefined}
      >
        {showLeadingIcon ? (
          <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--text)]">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleClick}
          className="text-glow-soft min-w-0 flex-1 truncate text-left text-[14px] font-semibold"
        >
          {conversation.title}
        </button>
        
        <button
          type="button"
          onClick={handlePinClick}
          className="rounded-lg p-1 opacity-0 transition-opacity hover:bg-[var(--hover)] group-hover:opacity-100"
          title={conversation.isPinned ? "Unpin" : "Pin"}
        >
          {conversation.isPinned ? (
            <PinOff className="h-4 w-4 rotate-[18deg] text-[var(--text)]" strokeWidth={1.9} />
          ) : (
            <Pin className="h-4 w-4 rotate-[18deg]" strokeWidth={1.9} />
          )}
        </button>

        <button
          type="button"
          onClick={handleMenuClick}
          className="rounded-lg p-1 opacity-0 transition-opacity hover:bg-[var(--hover)] group-hover:opacity-100"
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.9} />
        </button>
      </div>

      <ChatItemActionMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onRename={onRename}
        onPin={() => onPin(conversation._id)}
        onUnpin={() => onUnpin(conversation._id)}
        onDelete={() => onDelete(conversation)}
        isPinned={conversation.isPinned}
      />
    </div>
  );
}

export default ChatHistoryItem;
