import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function CopyCodeButton({ value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 px-2.5 text-[11px] text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--text)]"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function MarkdownCodeBlock({ className, children }) {
  const { theme } = useTheme();
  const rawCode = String(children || "").replace(/\n$/, "");
  const [isExpanded, setIsExpanded] = useState(false);
  const language = /language-(\w+)/.exec(className || "")?.[1] || "text";
  const isLongBlock = rawCode.split("\n").length > 16;
  const displayCode = isLongBlock && !isExpanded
    ? rawCode.split("\n").slice(0, 16).join("\n")
    : rawCode;

  return (
    <div className="my-4 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[color:var(--surface)]/88">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {language}
        </span>
        <div className="flex items-center gap-2">
          {isLongBlock ? (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/5 px-2.5 text-[11px] text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--text)]"
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{isExpanded ? "Collapse" : "Expand"}</span>
            </button>
          ) : null}
          <CopyCodeButton value={rawCode} />
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={theme === "dark" ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.84rem",
          lineHeight: 1.65,
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
          },
        }}
        wrapLongLines
      >
        {displayCode}
      </SyntaxHighlighter>
    </div>
  );
}

function AssistantMessageRenderer({ content }) {
  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }) => (
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-[var(--text)] first:mt-0">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mt-5 text-lg font-semibold text-[var(--text)] first:mt-0">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-4 text-base font-semibold text-[var(--text)] first:mt-0">{children}</h3>
      ),
      p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
      ul: ({ children }) => <ul className="mt-3 list-disc space-y-2 pl-5">{children}</ul>,
      ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-5">{children}</ol>,
      li: ({ children }) => <li className="pl-1">{children}</li>,
      blockquote: ({ children }) => (
        <blockquote className="my-4 rounded-r-2xl border-l-2 border-[var(--accent)] bg-white/5 px-4 py-3 text-[var(--text-soft)]">
          {children}
        </blockquote>
      ),
      hr: () => null,
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-4 transition hover:brightness-110"
        >
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div className="my-4 overflow-x-auto rounded-[20px] border border-[var(--border)]">
          <table className="min-w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
      th: ({ children }) => (
        <th className="border-b border-[var(--border)] px-3 py-2 text-left font-medium text-[var(--text)]">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-[var(--border)] px-3 py-2 align-top text-[var(--text-soft)]">
          {children}
        </td>
      ),
      inlineCode: ({ children }) => (
        <code className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[0.82em] text-[var(--text)]">
          {children}
        </code>
      ),
      code({ inline, className, children }) {
        if (inline) {
          return (
            <code className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[0.82em] text-[var(--text)]">
              {children}
            </code>
          );
        }

        return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
      },
    }),
    []
  );

  return (
    <div className="markdown-content text-sm leading-7 text-[var(--text-soft)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

export default AssistantMessageRenderer;
