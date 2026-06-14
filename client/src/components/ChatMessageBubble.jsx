import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  RefreshCcw,
  Trash2,
  Pencil,
  Share2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import AssistantMessageRenderer from "./AssistantMessageRenderer";

function ChatMessageBubble({
  message,
  currentUserName = "You",
  onEditRequest,
  onDeleteRequest,
  onRegenerateRequest,
  searchQuery = "",
  isSearchMatch = true,
  canRegenerate = false,
}) {
  const isUser = message.role === "user";
  const toolUsed = message.toolUsed;
  const toolName = message.toolName;
  const toolStatus = message.toolStatus;
  const providerUsed = message.providerUsed;
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content || "");

  const timestamp = useMemo(() => {
    if (!message.createdAt) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(new Date(message.createdAt));
  }, [message.createdAt]);

  const getToolLabel = () => {
    if (!toolUsed) {
      return null;
    }

    const labelMap = {
      createNoteTool: "Note saved",
      searchNotesTool: "Notes searched",
      createTaskTool: "Task created",
      listTasksTool: "Tasks listed",
      completeTaskTool: "Task completed",
      saveMemoryTool: "Memory saved",
      listMemoriesTool: "Memories listed",
      deleteMemoryTool: "Memory forgotten",
      memoryContext: "Memory used",
    };

    return labelMap[toolName] || "Action completed";
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    const shareText = `${isUser ? currentUserName : "SomuPilot"}: ${message.content || ""}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SomuPilot AI message",
          text: shareText,
        });
        return;
      } catch (_error) {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const saveEditedMessage = () => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue) {
      return;
    }

    setIsEditing(false);
    onEditRequest?.(trimmedValue, message);
  };

  const actionButtonClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--text)]";

  const highlightMessage = searchQuery.trim().length > 0 && isSearchMatch;

  return (
    <div className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-full ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className="mb-1.5 px-1 opacity-0 transition duration-150 group-hover:opacity-100 max-md:opacity-100">
          <span className="text-[11px] text-[var(--text-muted)]">{timestamp}</span>
        </div>

        <div
          className={`rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? "max-w-[600px] bg-[var(--accent)] text-slate-950"
              : "max-w-[760px] border border-[var(--border)] text-[var(--text-soft)]"
          }`}
          style={
            !isUser
              ? {
                  backgroundColor: "var(--surface-elevated)",
                  boxShadow: highlightMessage ? "0 0 0 1px rgba(20,184,166,0.35)" : undefined,
                }
              : highlightMessage
                ? { boxShadow: "0 0 0 1px rgba(15,23,42,0.16)" }
                : undefined
          }
        >
          {!isUser && toolUsed ? (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={toolName === "memoryContext" ? "purple" : "info"} className="text-[10px]">
                {getToolLabel()}
              </Badge>
              {toolStatus === "error" ? (
                <Badge variant="danger" className="text-[10px]">
                  Failed
                </Badge>
              ) : null}
            </div>
          ) : null}

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                rows={4}
                className={`w-full resize-none rounded-2xl border px-3 py-2.5 text-sm outline-none ${
                  isUser
                    ? "border-slate-950/15 bg-slate-950/10 text-slate-950 placeholder:text-slate-800/65"
                    : "border-[var(--border)] bg-white/5 text-[var(--text)] placeholder:text-[var(--text-muted)]"
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditValue(message.content || "");
                    setIsEditing(false);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedMessage}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-950/85 px-3 text-xs font-medium text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <AssistantMessageRenderer content={message.content} />
          )}

          {message.documentName ? (
            <div
              className={`mt-3 flex w-fit items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs ${
                isUser
                  ? "border border-slate-950/10 bg-slate-950/15 text-slate-900"
                  : "border border-[var(--border)] bg-white/5 text-[var(--text-soft)]"
              }`}
            >
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15h6M9 11h6M9 7h2" />
              </svg>
              <span className="max-w-[220px] truncate font-medium">{message.documentName}</span>
            </div>
          ) : null}
        </div>

        <div className={`mt-2 flex flex-wrap items-center gap-2 opacity-0 transition duration-150 group-hover:opacity-100 max-md:opacity-100 ${isUser ? "justify-end" : "justify-start"}`}>
          {isUser ? (
            <>
              <button type="button" onClick={() => setIsEditing(true)} className={actionButtonClass} aria-label="Edit message">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={handleCopy} className={actionButtonClass} aria-label="Copy message">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={handleShare} className={actionButtonClass} aria-label="Share message">
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onDeleteRequest?.(message)} className={actionButtonClass} aria-label="Delete message">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleCopy} className={actionButtonClass} aria-label="Copy response">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={handleShare} className={actionButtonClass} aria-label="Share response">
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFeedback((current) => (current === "like" ? null : "like"))}
                className={`${actionButtonClass} ${feedback === "like" ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-300" : ""}`}
                aria-label="Like response"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFeedback((current) => (current === "dislike" ? null : "dislike"))}
                className={`${actionButtonClass} ${feedback === "dislike" ? "border-rose-400/25 bg-rose-500/12 text-rose-300" : ""}`}
                aria-label="Dislike response"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
              {canRegenerate ? (
                <button
                  type="button"
                  onClick={() => onRegenerateRequest?.(message)}
                  className={actionButtonClass}
                  aria-label="Regenerate response"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </>
          )}

          {!isUser && providerUsed ? (
            <span className="text-[11px] text-[var(--text-muted)]">
              Answered by {providerUsed.charAt(0).toUpperCase() + providerUsed.slice(1)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ChatMessageBubble;
