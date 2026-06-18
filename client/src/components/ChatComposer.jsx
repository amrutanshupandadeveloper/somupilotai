import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Cpu,
  Gauge,
  Leaf,
  Route,
  Sparkles,
  Zap,
} from "lucide-react";
import { CreditBadge } from "./ui/CreditBadge";
import { documentService } from "../services/documentService";
import {
  buildModelPresetOptions,
  formatProviderName,
  normalizeModelPreset,
} from "../utils/modelPresets";

const getPresetIconConfig = (presetKey, provider) => {
  const normalizedPreset = normalizeModelPreset(presetKey);
  const normalizedProvider = String(provider || "").trim().toLowerCase();

  if (normalizedPreset === "high") {
    return {
      icon: Zap,
      className: "bg-gradient-to-br from-amber-400/30 via-orange-400/24 to-yellow-300/18 text-amber-200",
    };
  }

  if (normalizedPreset === "medium") {
    return {
      icon: Gauge,
      className: "bg-gradient-to-br from-sky-400/24 via-cyan-400/20 to-teal-400/20 text-cyan-200",
    };
  }

  if (normalizedPreset === "low") {
    if (normalizedProvider === "ollama") {
      return {
        icon: Cpu,
        className: "bg-gradient-to-br from-emerald-400/24 via-lime-400/18 to-slate-400/18 text-emerald-200",
      };
    }

    return {
      icon: Leaf,
      className: "bg-gradient-to-br from-emerald-400/24 via-green-400/18 to-slate-400/18 text-emerald-200",
    };
  }

  if (normalizedProvider === "openrouter") {
    return {
      icon: Route,
      className: "bg-gradient-to-br from-violet-400/22 via-indigo-400/20 to-sky-400/18 text-violet-200",
    };
  }

  return {
    icon: Sparkles,
    className: "bg-gradient-to-br from-fuchsia-400/20 via-violet-400/22 to-teal-400/20 text-fuchsia-100",
  };
};

const getPresetStatusLabel = (option, cooldownSeconds) => {
  if (option.key === "auto") {
    return "";
  }

  if (!option.configured) {
    return "Not configured";
  }

  if (cooldownSeconds > 0) {
    return `Cooling down ${cooldownSeconds}s`;
  }

  if (option.status === "local_only") {
    return "Local only";
  }

  return "";
};

function PresetIcon({ presetKey, provider, className = "" }) {
  const { icon: Icon, className: iconClassName } = getPresetIconConfig(presetKey, provider);

  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${iconClassName} ${className}`}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function ChatComposer({
  value,
  onChange,
  onSubmit,
  onProviderChange,
  selectedPreset = "auto",
  isSending,
  disabled,
  helperText,
  usage,
  usageCountdown,
  onUsageUpdate,
  providerStatus,
  attachedFile,
  setAttachedFile,
  attachmentStatus,
  setAttachmentStatus,
  isUploading,
  setIsUploading,
  onStop,
}) {
  const textareaRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [cooldownTick, setCooldownTick] = useState(0);
  const modelOptions = useMemo(() => buildModelPresetOptions(providerStatus), [providerStatus]);
  const activeOption =
    modelOptions.find((option) => option.key === normalizeModelPreset(selectedPreset)) ||
    modelOptions[0];

  const getCooldownSeconds = (option) => {
    const cooldownUntil = option?.cooldown?.cooldownUntil;

    if (!cooldownUntil) {
      return 0;
    }

    return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  };

  const hasActiveCooldown = useMemo(
    () =>
      modelOptions.some((option) => {
        if (option.key === "auto") {
          return false;
        }

        return getCooldownSeconds(option) > 0;
      }),
    [modelOptions, cooldownTick]
  );

  useEffect(() => {
    if (!hasActiveCooldown) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCooldownTick((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasActiveCooldown]);

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

  const handleSelectModel = (presetKey) => {
    const nextOption = modelOptions.find((option) => option.key === presetKey);

    if (!nextOption) {
      return;
    }

    const cooldownSeconds = getCooldownSeconds(nextOption);

    if (nextOption.key !== "auto" && (!nextOption.configured || cooldownSeconds > 0)) {
      return;
    }

    onProviderChange?.(nextOption.key);
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
                x
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
                    <svg className="mr-2.5 h-4 w-4 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="mr-2.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="mr-2.5 h-4 w-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="inline-flex h-[38px] items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-2.5 text-xs font-medium text-[var(--text)] transition hover:border-[var(--border-strong)] hover:bg-white/10"
                  aria-label="Select response quality"
                >
                  <PresetIcon presetKey={activeOption?.key} provider={activeOption?.provider} className="h-6 w-6" />
                  <span>{activeOption?.label || "Auto"}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isModelMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isModelMenuOpen ? (
                  <div
                    className="absolute bottom-11 right-0 z-30 w-[min(320px,calc(100vw-2rem))] rounded-3xl border border-[var(--border)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                    style={{ backgroundColor: "var(--surface-elevated)" }}
                  >
                    <div className="mb-1 px-2 py-1">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        Model quality
                      </p>
                    </div>

                    <div className="space-y-1">
                      {modelOptions.map((option) => {
                        const cooldownSeconds = getCooldownSeconds(option);
                        const isDisabled =
                          option.key !== "auto" && (!option.configured || cooldownSeconds > 0);
                        const statusLabel = getPresetStatusLabel(option, cooldownSeconds);
                        const isSelected = activeOption?.key === option.key;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => handleSelectModel(option.key)}
                            disabled={isDisabled}
                            className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                              isSelected
                                ? "border-teal-400/30 bg-teal-500/10"
                                : "border-transparent hover:border-[var(--border)] hover:bg-white/5"
                            } ${isDisabled ? "cursor-not-allowed opacity-65" : ""}`}
                          >
                            <PresetIcon presetKey={option.key} provider={option.provider} />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[var(--text)]">{option.label}</p>
                                {statusLabel ? (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                                    {statusLabel}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-[var(--text-soft)]">
                                {option.key === "auto"
                                  ? option.description
                                  : `${formatProviderName(option.provider)} · ${option.modelName || "Default model"}`}
                              </p>
                              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                {option.key === "auto"
                                  ? "Best available provider automatically"
                                  : option.description}
                              </p>
                            </div>

                            {isSelected ? (
                              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/14 text-teal-300">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={isSending ? onStop : onSubmit}
                disabled={isSending ? false : !canSend}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-muted)]"
                style={canSend || isSending ? { backgroundColor: "var(--accent)" } : undefined}
                aria-label={isSending ? "Stop generating" : "Send message"}
              >
                {isSending ? (
                  <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-[2px] bg-slate-950" />
                ) : (
                  <span aria-hidden="true">^</span>
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
