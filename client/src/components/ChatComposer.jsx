import { useEffect, useMemo, useRef, useState } from "react";
import { CreditBadge } from "./ui/CreditBadge";
import { documentService } from "../services/documentService";

const MODEL_STORAGE_KEY = "somupilot_ai_model_preference";
const MODEL_OPTIONS = ["Auto", "Gemini", "Groq", "OpenRouter", "Ollama"];

function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  disabled,
  helperText,
  usage,
  usageCountdown,
  onUsageUpdate,
}) {
  const textareaRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem(MODEL_STORAGE_KEY) || "Auto"
  );
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachmentStatus, setAttachmentStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
    textareaRef.current.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!composerRef.current?.contains(event.target)) {
        setIsAttachMenuOpen(false);
        setIsModelMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsAttachMenuOpen(false);
        setIsModelMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const canSend = useMemo(
    () => !disabled && !isSending && !isUploading && Boolean(value.trim()),
    [disabled, isSending, isUploading, value]
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem(MODEL_STORAGE_KEY, model);
    setIsModelMenuOpen(false);
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setAttachmentStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdfSelection = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAttachedFile({
      name: file.name,
      type: "PDF",
    });
    setAttachmentStatus("Uploading PDF...");
    setIsUploading(true);
    setIsAttachMenuOpen(false);

    try {
      const response = await documentService.uploadDocument(file);
      setAttachmentStatus("PDF uploaded");
      if (response.data?.usage && onUsageUpdate) {
        onUsageUpdate(response.data.usage);
      }
      window.setTimeout(() => {
        clearAttachment();
      }, 1600);
    } catch (error) {
      setAttachmentStatus(error.response?.data?.message || "PDF upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="sticky bottom-0 z-20 border-t border-[var(--border)] px-4 pb-5 pt-4 backdrop-blur xl:px-6"
      style={{ backgroundColor: "var(--surface-glass)" }}
    >
      <div className="mx-auto max-w-[860px]" ref={composerRef}>
        <div
          className="rounded-[30px] border border-[var(--border)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition focus-within:border-[var(--border-strong)]"
          style={{ backgroundColor: "var(--surface-elevated)" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfSelection}
          />

          {attachedFile ? (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-soft)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                {attachedFile.type === "PDF" ? "PDF" : "FILE"}
              </span>
              <span className="max-w-[220px] truncate sm:max-w-[320px]">{attachedFile.name}</span>
              <span className="text-[var(--text-muted)]">{attachmentStatus}</span>
              <button
                type="button"
                onClick={clearAttachment}
                className="ml-auto rounded-full px-2 py-1 text-[var(--text-muted)] transition hover:bg-white/5 hover:text-[var(--text)]"
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="relative flex items-end gap-3 md:flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsAttachMenuOpen((current) => !current);
                  setIsModelMenuOpen(false);
                }}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-lg text-[var(--text)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
                aria-label="Attach file"
                title="Attach file"
              >
                +
              </button>

              {isAttachMenuOpen ? (
                <div
                  className="absolute bottom-12 left-0 z-30 min-w-[180px] rounded-2xl border border-[var(--border)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                  style={{ backgroundColor: "var(--surface-elevated)" }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    Upload PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentStatus("Image upload coming soon");
                      setAttachedFile({ name: "Image upload", type: "IMAGE" });
                      setIsAttachMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentStatus("Document upload coming soon");
                      setAttachedFile({ name: "Document upload", type: "DOC" });
                      setIsAttachMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    Upload Document
                  </button>
                </div>
              ) : null}

              <textarea
                ref={textareaRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything..."
                className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-7 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                disabled={disabled}
                aria-label="Message SomuPilot"
              />
            </div>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsModelMenuOpen((current) => !current);
                    setIsAttachMenuOpen(false);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 text-xs font-medium text-[var(--text)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
                  aria-label="Select model"
                >
                  <span>{selectedModel}</span>
                  <span aria-hidden="true">▾</span>
                </button>

                {isModelMenuOpen ? (
                  <div
                    className="absolute bottom-12 right-0 z-30 min-w-[160px] rounded-2xl border border-[var(--border)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                    style={{ backgroundColor: "var(--surface-elevated)" }}
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => handleSelectModel(model)}
                        className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition ${
                          selectedModel === model
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "text-[var(--text)] hover:bg-white/5"
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSend}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-muted)]"
                style={canSend ? { backgroundColor: "var(--accent)" } : undefined}
                aria-label={isSending ? "Sending message" : "Send message"}
              >
                {isSending ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950/35 border-t-slate-950" />
                ) : (
                  <span aria-hidden="true">↑</span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {usage?.aiCredits === 0 ? (
                <p className="text-xs text-amber-300">Credits finished. Renews soon.</p>
              ) : helperText ? (
                <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
              ) : null}
              <p className="text-[11px] text-[var(--text-muted)]">
                SomuPilot can make mistakes. Verify important information.
              </p>
            </div>

            {usage ? (
              <CreditBadge
                credits={usage.aiCredits}
                maxCredits={usage.maxAiCredits}
                countdown={usageCountdown}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatComposer;
