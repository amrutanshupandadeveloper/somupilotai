import { Badge } from "./ui/Badge";

function ChatMessageBubble({ message }) {
  const isUser = message.role === "user";
  const toolUsed = message.toolUsed;
  const toolName = message.toolName;
  const toolStatus = message.toolStatus;

  const getToolLabel = () => {
    if (!toolUsed) return null;
    
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

    return labelMap[toolName] || "Action performed";
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 shadow-sm sm:max-w-[75%] ${
          isUser
            ? "bg-sky-400 text-slate-950 rounded-br-md"
            : "border border-white/10 bg-slate-900/80 text-slate-100 rounded-bl-md"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-70">
            {isUser ? "You" : "SomuPilot"}
          </p>
          {toolUsed && !isUser && (
            <Badge variant={toolName === "memoryContext" ? "purple" : "info"} className="text-[9px]">
              {getToolLabel()}
            </Badge>
          )}
          {toolStatus === "error" && (
            <Badge variant="danger" className="text-[9px]">
              Failed
            </Badge>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

export default ChatMessageBubble;
