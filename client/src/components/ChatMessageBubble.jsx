import { Badge } from "./ui/Badge";

function ChatMessageBubble({ message, currentUserName = "You" }) {
  const isUser = message.role === "user";
  const toolUsed = message.toolUsed;
  const toolName = message.toolName;
  const toolStatus = message.toolStatus;
  const providerUsed = message.providerUsed;

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

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)]"
          style={{ backgroundColor: "var(--surface-elevated)" }}
        >
          S
        </div>
      ) : null}

      <div className={`max-w-full ${isUser ? "order-1" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? "max-w-[600px] bg-[var(--accent)] text-slate-950"
              : "max-w-[700px] border border-[var(--border)] text-[var(--text-soft)]"
          }`}
          style={!isUser ? { backgroundColor: "var(--surface-elevated)" } : undefined}
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

          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {!isUser && providerUsed ? (
          <p className="mt-2 pl-1 text-[11px] text-[var(--text-muted)]">
            Answered by {providerUsed.charAt(0).toUpperCase() + providerUsed.slice(1)}
          </p>
        ) : null}
      </div>

      {isUser ? (
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)]"
          style={{ backgroundColor: "var(--surface-elevated)" }}
        >
          {(currentUserName || "U")
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0] || "")
            .join("")
            .toUpperCase()}
        </div>
      ) : null}
    </div>
  );
}

export default ChatMessageBubble;
