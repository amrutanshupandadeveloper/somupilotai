import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatItemActionMenu from "./ChatItemActionMenu";

function ChatHistoryItem({ conversation, isActive, onSelect, onPin, onUnpin, onDelete, onRename }) {
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
      <button
        onClick={handleClick}
        className={`flex min-h-[42px] w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all ${
          isActive
            ? "bg-teal-500/10 text-teal-400"
            : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
        }`}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span className="flex-1 truncate text-[13px]">{conversation.title}</span>
        
        <button
          onClick={handlePinClick}
          className={`rounded p-1 opacity-0 transition-opacity hover:bg-[var(--hover)] group-hover:opacity-100 ${
            conversation.isPinned ? "opacity-100 text-teal-400" : ""
          }`}
          title={conversation.isPinned ? "Unpin" : "Pin"}
        >
          <svg
            className="w-4 h-4"
            fill={conversation.isPinned ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>

        <button
          onClick={handleMenuClick}
          className="rounded p-1 opacity-0 transition-opacity hover:bg-[var(--hover)] group-hover:opacity-100"
          title="More options"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </button>

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
