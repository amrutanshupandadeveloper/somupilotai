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
      <div className="max-w-full">
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

          {message.documentName ? (
            <div className={`mt-2.5 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs w-fit ${
              isUser
                ? "bg-slate-950/15 border border-slate-950/10 text-slate-900"
                : "bg-white/5 border border-[var(--border)] text-[var(--text-soft)]"
            }`}>
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15h6M9 11h6M9 7h2" />
              </svg>
              <span className="font-medium truncate max-w-[200px]">{message.documentName}</span>
            </div>
          ) : null}
        </div>

        {!isUser && providerUsed ? (
          <p className="mt-2 pl-1 text-[11px] text-[var(--text-muted)]">
            Answered by {providerUsed.charAt(0).toUpperCase() + providerUsed.slice(1)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default ChatMessageBubble;
