function ChatMessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[75%] ${
          isUser
            ? "bg-sky-400 text-slate-950"
            : "border border-white/10 bg-slate-900/80 text-slate-100"
        }`}
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70">
          {isUser ? "You" : "SomuPilot"}
        </p>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

export default ChatMessageBubble;
