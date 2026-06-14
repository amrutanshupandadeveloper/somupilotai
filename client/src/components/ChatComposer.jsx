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
  attachedFile,
  setAttachedFile,
  attachmentStatus,
  setAttachmentStatus,
  isUploading,
  setIsUploading,
}) {
  const textareaRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem(MODEL_STORAGE_KEY) || "Auto"
  );

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
      setAttachedFile({
        id: response.data._id,
        name: file.name,
        type: "PDF",
      });
      setAttachmentStatus("Attached to message");
    } catch (error) {
      setAttachmentStatus(error.response?.data?.message || "PDF upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 px-4 pb-3 pt-2 xl:px-6">
      <div className="mx-auto max-w-[860px]" ref={composerRef}>
        <div
          className="rounded-[22px] border border-[var(--border)] px-3 py-2 shadow-none transition focus-within:border-[var(--border)] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
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
            <div className="mb-2.5 flex items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-soft)]">
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

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex items-center gap-2 md:flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsAttachMenuOpen((current) => !current);
                  setIsModelMenuOpen(false);
                }}
                className="inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/5 text-base text-[var(--text)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
                aria-label="Attach file"
                title="Attach file"
              >
                +
              </button>

              {isAttachMenuOpen ? (
                <div
                  className="absolute bottom-10 left-0 z-30 min-w-[195px] rounded-2xl border border-[var(--border)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                  style={{ backgroundColor: "var(--surface-elevated)" }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    <svg className="h-4 w-4 text-rose-400 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15h6M9 11h6M9 7h2" />
                    </svg>
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentStatus("Image upload coming soon");
                      setAttachedFile({ name: "Image upload", type: "IMAGE" });
                      setIsAttachMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    <svg className="h-4 w-4 text-emerald-400 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentStatus("Document upload coming soon");
                      setAttachedFile({ name: "Document upload", type: "DOC" });
                      setIsAttachMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    <svg className="h-4 w-4 text-blue-400 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Upload Document</span>
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
                className="min-h-[34px] flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm leading-5 text-[var(--text)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                disabled={disabled}
                aria-label="Message SomuPilot"
              />
            </div>

            <div className="flex items-center justify-between gap-2 md:justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsModelMenuOpen((current) => !current);
                    setIsAttachMenuOpen(false);
                  }}
                  className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 text-xs font-medium text-[var(--text)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
                  aria-label="Select model"
                >
                  <span>{selectedModel}</span>
                  <span aria-hidden="true">▾</span>
                </button>

                {isModelMenuOpen ? (
                  <div
                  className="absolute bottom-10 right-0 z-30 min-w-[160px] rounded-2xl border border-[var(--border)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
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
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-muted)]"
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

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-[var(--border)] px-1 pt-2">
            <div className="min-w-0 flex-1 text-left">
              {usage?.aiCredits === 0 ? (
                <p className="truncate text-[11px] text-amber-300">Credits finished. Renews soon.</p>
              ) : helperText ? (
                <p className="truncate text-[11px] text-[var(--text-muted)]">{helperText}</p>
              ) : (
                <p className="truncate text-[11px] text-[var(--text-muted)]">&nbsp;</p>
              )}
            </div>

            <p className="hidden flex-1 text-center text-[10px] text-[var(--text-muted)] sm:block">
              SomuPilot can make mistakes. Verify important information.
            </p>

            {usage ? (
              <div className="flex min-w-0 flex-1 justify-end">
                <CreditBadge
                  credits={usage.aiCredits}
                  maxCredits={usage.maxAiCredits}
                  countdown={usageCountdown}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatComposer;
