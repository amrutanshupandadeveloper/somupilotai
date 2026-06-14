import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function ChatPreviewMockup() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    let timers = [];

    const CHAT_STEPS = [
      {
        role: "user",
        content: "Hi SomuPilot! What features do you have?",
      },
      {
        role: "assistant",
        content: "I'm your workspace AI assistant! I can manage tasks, search notes, remember preferences, and analyze uploaded PDFs.",
        typing: true,
      },
      {
        role: "user",
        content: "Wow! Can you summarize this document for me?",
        documentName: "project_brief.pdf",
      },
      {
        role: "assistant",
        content: "Sure! This brief outlines a new React website design. I've also added 'Start code setup' to your task list.",
        badge: "Reading PDF...",
        badge2: "Task Created",
        typing: true,
      },
      {
        role: "user",
        content: "Remember that I prefer dark theme for coding.",
      },
      {
        role: "assistant",
        content: "Got it! I've saved that to your smart preferences so I can customize future responses.",
        badge: "Memory Saved",
        typing: true,
      }
    ];

    const runConversation = async () => {
      if (!active) return;
      setMessages([]);
      setIsTyping(false);

      for (let i = 0; i < CHAT_STEPS.length; i++) {
        const step = CHAT_STEPS[i];
        if (!active) return;

        if (step.typing) {
          setIsTyping(true);
          await new Promise(resolve => {
            const t = setTimeout(resolve, 1500);
            timers.push(t);
          });
          if (!active) return;
          setIsTyping(false);
        }

        setMessages(prev => [...prev, step]);

        // Scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }

        await new Promise(resolve => {
          const t = setTimeout(resolve, 2200);
          timers.push(t);
        });
        if (!active) return;
      }

      // Loop delay before restarting
      await new Promise(resolve => {
        const t = setTimeout(resolve, 4000);
        timers.push(t);
      });
      if (active) {
        runConversation();
      }
    };

    runConversation();

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(20,184,166,0.12)] flex flex-col h-[350px] w-full">
      {/* MacOS buttons */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/2 px-5 py-3">
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">SOMUPILOT AI CHAT PREVIEW</span>
        <div className="w-10" />
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-4 sidebar-scroll scroll-smooth">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`rounded-2xl px-4 py-2.5 text-xs leading-5 shadow-sm max-w-[85%] ${
              msg.role === "user"
                ? "bg-[var(--accent)] text-slate-950 rounded-tr-none font-medium"
                : "bg-white/5 border border-white/10 text-[var(--text-soft)] rounded-tl-none"
            }`}>
              {msg.badge ? (
                <span className="inline-flex items-center rounded bg-teal-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-300 border border-teal-400/20 mb-1.5 mr-1.5">
                  {msg.badge}
                </span>
              ) : null}
              {msg.badge2 ? (
                <span className="inline-flex items-center rounded bg-purple-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-purple-300 border border-purple-400/20 mb-1.5 mr-1.5">
                  {msg.badge2}
                </span>
              ) : null}
              {msg.documentName ? (
                <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-slate-950/20 px-2 py-1 border border-slate-950/10 text-[10px] w-fit">
                  <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15h6M9 11h6M9 7h2" />
                  </svg>
                  <span>{msg.documentName}</span>
                </div>
              ) : null}
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 text-[var(--text-soft)] rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
              <div className="flex gap-1 items-center h-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/5 bg-white/2 p-3 flex items-center gap-2">
        <div className="rounded-full bg-white/5 border border-white/5 px-4 py-1.5 text-[10px] text-[var(--text-muted)] flex-1">
          Ask SomuPilot anything...
        </div>
        <div className="h-6 w-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 text-[10px] font-bold">
          ↑
        </div>
      </div>
    </div>
  );
}

function AuthForm({
  title,
  subtitle,
  fields,
  formData,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
  alternateText,
  alternateTo,
  alternateLabel,
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center">
      <div className="hidden space-y-6 lg:block">
        <div>
          <p className="app-kicker">SomuPilot AI</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text)]">
            Your personal AI workspace, designed for calm focus.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-soft)]">
            Keep chats, notes, tasks, memories, and documents in one polished command
            center. Secure sign-in unlocks your full assistant experience.
          </p>
        </div>

        <ChatPreviewMockup />
      </div>

      <div className="app-gradient-border app-card mx-auto w-full max-w-md rounded-[32px] p-8 sm:p-9 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-500/10 blur-[60px]" />
        
        <div className="mb-8 relative z-10">
          <p className="app-kicker">SomuPilot AI</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text)]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={onSubmit}>
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                {field.label}
              </span>
              <input
                className="app-input"
                name={field.name}
                type={field.type}
                value={formData[field.name] || ""}
                onChange={onChange}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                required={field.required}
              />
            </label>
          ))}

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 animate-[menu-pop_180ms_ease-out]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3.5 font-semibold text-slate-950 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)] relative z-10">
          {alternateText}{" "}
          <Link
            to={alternateTo}
            className="font-medium text-[var(--accent)] transition hover:brightness-110"
          >
            {alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
