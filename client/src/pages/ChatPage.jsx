import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import ChatComposer from "../components/ChatComposer";
import ChatMessageBubble from "../components/ChatMessageBubble";
import ThinkingIndicator from "../components/ThinkingIndicator";
import ScrollToBottom from "../components/ScrollToBottom";
import { useAuth } from "../hooks/useAuth";
import * as chatService from "../services/chatService";
import { getFriendlyAiErrorMessage } from "../utils/aiError";
import { getAiProviderStatus } from "../services/aiService";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  buildModelPresetOptions,
  getStoredModelPreset,
  normalizeModelPreset,
  persistModelPreset,
} from "../utils/modelPresets";

const suggestedPrompts = [
  "Plan my study day",
  "Create a task",
  "Summarize my notes",
  "Ask from a PDF",
  "Save this as memory",
];

const WEB_SEARCH_KEYWORDS = [
  "latest",
  "current",
  "today",
  "2026",
  "search web",
  "website scan",
  "news",
  "price",
  "job vacancy",
  "github repo scan",
  "docs",
  "recent",
];

const needsWebSearch = (query = "") => {
  const lowerQuery = String(query || "").trim().toLowerCase();
  return WEB_SEARCH_KEYWORDS.some((keyword) => lowerQuery.includes(keyword));
};

const emitConversationRefresh = () => {
  window.dispatchEvent(new CustomEvent("somupilot:conversations-updated"));
};

function ChatTopBarActions({
  activeConversation,
  usage,
  usageCountdown,
  onCopyConversation,
  onCopyLink,
  onExportConversation,
  onExportMarkdown,
  onRename,
  onTogglePin,
  onDelete,
  onSearchToggle,
  toastMessage,
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!actionsRef.current?.contains(event.target)) {
        setIsShareOpen(false);
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsShareOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const actionButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-[var(--text-muted)] transition hover:bg-white/10 hover:text-[var(--text)]";

  return (
    <div className="flex items-center gap-2" ref={actionsRef}>
      {usage ? (
        <div className="hidden sm:block">
          <Badge variant={usage.aiCredits <= 0 ? "danger" : usage.aiCredits <= 5 ? "warning" : "success"}>
            {usage.aiCredits}/{usage.maxAiCredits} credits
          </Badge>
        </div>
      ) : null}

      <div className="relative">
        <button
          type="button"
          className={actionButtonClass}
          onClick={() => {
            setIsShareOpen((current) => !current);
            setIsMenuOpen(false);
          }}
          aria-label="Share"
          title="Share"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C9.886 12.511 11.326 12 12.88 12c1.554 0 2.994.511 4.196 1.342M8.684 10.658C9.886 11.489 11.326 12 12.88 12c1.554 0 2.994-.511 4.196-1.342M10 6a2 2 0 11-4 0 2 2 0 014 0zm12 12a2 2 0 11-4 0 2 2 0 014 0zm-12 0a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>

        {isShareOpen ? (
          <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] p-2 shadow-2xl backdrop-blur-xl animate-[menu-pop_180ms_ease-out]">
            <button
              type="button"
              onClick={() => {
                onCopyLink();
                setIsShareOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
            >
              Copy chat link
            </button>
            <button
              type="button"
              onClick={() => {
                onCopyConversation();
                setIsShareOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
            >
              Copy conversation text
            </button>
            <button
              type="button"
              onClick={() => {
                onExportConversation();
                setIsShareOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
            >
              Export as text
            </button>
            <button
              type="button"
              onClick={() => {
                onExportMarkdown();
                setIsShareOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
            >
              Export as markdown
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          className={actionButtonClass}
          onClick={() => {
            setIsMenuOpen((current) => !current);
            setIsShareOpen(false);
          }}
          aria-label="Chat options"
          title="Chat options"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] p-2 shadow-2xl backdrop-blur-xl animate-[menu-pop_180ms_ease-out]">
            <button
              type="button"
              onClick={() => {
                onRename();
                setIsMenuOpen(false);
              }}
              disabled={!activeConversation?._id}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rename chat
            </button>
            <button
              type="button"
              onClick={() => {
                onTogglePin();
                setIsMenuOpen(false);
              }}
              disabled={!activeConversation?._id}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeConversation?.isPinned ? "Unpin chat" : "Pin chat"}
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchToggle();
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
            >
              Search in chat
            </button>
            <button
              type="button"
              onClick={() => {
                onExportConversation();
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
            >
              Export chat
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setIsMenuOpen(false);
              }}
              disabled={!activeConversation?._id}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete chat
            </button>
          </div>
        ) : null}
      </div>

      {toastMessage ? (
        <div className="pointer-events-none absolute right-4 top-[calc(100%+12px)] z-30 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 shadow-xl">
          {toastMessage}
          {usage?.aiCredits === 0 ? null : null}
          {usageCountdown ? null : null}
        </div>
      ) : null}
    </div>
  );
}

function ChatPage() {
  const { user, usage, usageCountdown, setUsage, refreshUsageSafely } = useAuth();
  const { setTopBarConfig, resetTopBarConfig } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConversation, setActiveConversation] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachmentStatus, setAttachmentStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerRateLimitUntil, setProviderRateLimitUntil] = useState(null);
  const [providerRateLimitTick, setProviderRateLimitTick] = useState(0);
  const [providerStatus, setProviderStatus] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(getStoredModelPreset);
  const [thinkingState, setThinkingState] = useState({
    active: false,
    status: "thinking",
    usesWebSearch: false,
  });
  const abortControllerRef = useRef(null);
  const thinkingTimeoutsRef = useRef([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const activeConversationId = searchParams.get("conversationId");
  const currentMessages = activeConversation?.messages || [];
  const modelPresetOptions = useMemo(
    () => buildModelPresetOptions(providerStatus),
    [providerStatus]
  );
  const activePresetOption =
    modelPresetOptions.find((option) => option.key === selectedPreset) || modelPresetOptions[0];

  const conversationText = useMemo(
    () =>
      currentMessages
        .map((message) => `${message.role === "assistant" ? "SomuPilot" : user?.name || "You"}: ${message.content}`)
        .join("\n\n"),
    [currentMessages, user?.name]
  );

  const conversationMarkdown = useMemo(
    () =>
      currentMessages
        .map((message) => {
          const speaker = message.role === "assistant" ? "## SomuPilot" : `## ${user?.name || "You"}`;
          return `${speaker}\n\n${message.content}`;
        })
        .join("\n\n"),
    [currentMessages, user?.name]
  );

  useEffect(() => {
    refreshUsageSafely().catch(() => {});
  }, []);

  useEffect(() => {
    const loadProviderStatus = async () => {
      try {
        const response = await getAiProviderStatus();
        setProviderStatus(response.data);
      } catch (_error) {
        setProviderStatus(null);
      }
    };

    loadProviderStatus();
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (!providerRateLimitUntil) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProviderRateLimitTick((current) => current + 1);

      if (Date.now() >= providerRateLimitUntil) {
        setProviderRateLimitUntil(null);
        setError("");
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [providerRateLimitUntil]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!activeConversationId) {
        setActiveConversation(null);
        return;
      }

      setIsLoadingMessages(true);
      setError("");

      try {
        const response = await chatService.getConversation(activeConversationId);
        setActiveConversation(response.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Unable to load this conversation");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadConversation();
  }, [activeConversationId]);

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, isSending, isNearBottom]);

  useEffect(
    () => () => {
      thinkingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      thinkingTimeoutsRef.current = [];
    },
    []
  );

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return undefined;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 120);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const copyToClipboard = async (value, successMessage = "Copied") => {
    await navigator.clipboard.writeText(value);
    setToastMessage(successMessage);
  };

  const handleExportConversation = () => {
    const exportText = conversationText || "No conversation yet.";
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeConversation?.title || "somupilot-chat").replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setToastMessage("Exported");
  };

  const handleExportMarkdown = () => {
    const exportText = conversationMarkdown || "# SomuPilot Chat\n\nNo conversation yet.";
    const blob = new Blob([exportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeConversation?.title || "somupilot-chat").replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setToastMessage("Markdown exported");
  };

  const handleTogglePin = async () => {
    if (!activeConversation?._id) {
      return;
    }

    const response = await chatService.toggleConversationPin(activeConversation._id);
    setActiveConversation((current) =>
      current ? { ...current, isPinned: response.data.isPinned, pinnedAt: response.data.pinnedAt } : current
    );
    emitConversationRefresh();
    setToastMessage(response.message || "Updated");
  };

  const handleRenameConversation = async () => {
    const nextTitle = renameValue.trim();

    if (!activeConversation?._id || !nextTitle) {
      return;
    }

    const response = await chatService.updateConversationTitle(activeConversation._id, nextTitle);
    setActiveConversation((current) => (current ? { ...current, title: response.data.title } : current));
    emitConversationRefresh();
    setRenameModalOpen(false);
    setToastMessage("Chat renamed");
  };

  const handleDeleteConversation = async () => {
    if (!activeConversation?._id) {
      return;
    }

    await chatService.deleteConversation(activeConversation._id);
    setDeleteModalOpen(false);
    setActiveConversation(null);
    setSearchParams({});
    emitConversationRefresh();
    setToastMessage("Chat deleted");
  };

  const handleEditRequest = (nextMessage) => {
    setDraftMessage(nextMessage);
    setToastMessage("Edited message moved to composer");
  };

  const handleDeleteMessageRequest = (message) => {
    setActiveConversation((current) =>
      current
        ? {
            ...current,
            messages: current.messages.filter((item) => item !== message),
          }
        : current
    );
    setToastMessage("Message removed from view");
  };

  const handleAssistantUpdateRequest = (targetMessage, nextContent) => {
    setActiveConversation((current) =>
      current
        ? {
            ...current,
            messages: current.messages.map((item) =>
              item === targetMessage
                ? {
                    ...item,
                    content: nextContent,
                  }
                : item
            ),
          }
        : current
    );
    setToastMessage("Response updated");
  };

  const handleStopGenerating = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSending(false);
    setToastMessage("Generation stopped");
    setActiveConversation((current) => {
      if (!current) {
        return current;
      }

      const nextMessages = [...current.messages];
      const lastMessage = nextMessages[nextMessages.length - 1];
      if (lastMessage?.role === "user") {
        nextMessages.pop();
      }

      return {
        ...current,
        messages: nextMessages,
      };
    });
  };

  const handleRegenerate = (assistantMessage) => {
    if (usage?.aiCredits === 0) {
      setError(`Your AI credits are finished. Please wait until credits renew in ${usageCountdown}.`);
      return;
    }

    const assistantIndex = currentMessages.findIndex((message) => message === assistantMessage);
    if (assistantIndex <= 0) {
      return;
    }

    for (let index = assistantIndex - 1; index >= 0; index -= 1) {
      if (currentMessages[index]?.role === "user") {
        handleSend(currentMessages[index].content);
        setToastMessage("Regenerating response");
        return;
      }
    }
  };

  useEffect(() => {
    setTopBarConfig({
      title: activeConversation?.title || "Chat",
      subtitle: "SomuPilot AI",
      compact: true,
      showSignedIn: false,
      showUsage: false,
      rightSlot: (
        <ChatTopBarActions
          activeConversation={activeConversation}
          usage={usage}
          usageCountdown={usageCountdown}
          onCopyConversation={() => copyToClipboard(conversationText || "No conversation yet.", "Copied")}
          onCopyLink={() => copyToClipboard(window.location.href, "Chat link copied")}
          onExportConversation={handleExportConversation}
          onExportMarkdown={handleExportMarkdown}
          onRename={() => {
            setRenameValue(activeConversation?.title || "");
            setRenameModalOpen(true);
          }}
          onTogglePin={handleTogglePin}
          onDelete={() => setDeleteModalOpen(true)}
          onSearchToggle={() => setSearchOpen((current) => !current)}
          toastMessage={toastMessage}
        />
      ),
    });

    return () => {
      resetTopBarConfig();
    };
  }, [activeConversation, usage, usageCountdown, conversationText, toastMessage]);

  const handleSend = async (prefilledMessage = null) => {
    const messageToSend = (prefilledMessage ?? draftMessage).trim();

    if (!messageToSend || isSending) {
      return;
    }

    const documentId = attachedFile?.id || null;
    const documentName = attachedFile?.name || "";
    const usesWebSearch = needsWebSearch(messageToSend);
    abortControllerRef.current = new AbortController();

    thinkingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    thinkingTimeoutsRef.current = [];

    if (!prefilledMessage) {
      setDraftMessage("");
    }

    setIsSending(true);
    setError("");
    setThinkingState({
      active: true,
      status: usesWebSearch ? "searching_web" : "thinking",
      usesWebSearch,
    });

    if (usesWebSearch) {
      thinkingTimeoutsRef.current = [
        window.setTimeout(
          () => setThinkingState((current) => ({ ...current, status: "searching_web" })),
          200
        ),
        window.setTimeout(
          () => setThinkingState((current) => ({ ...current, status: "reading_sources" })),
          900
        ),
        window.setTimeout(
          () => setThinkingState((current) => ({ ...current, status: "writing_answer" })),
          1700
        ),
      ];
    } else {
      thinkingTimeoutsRef.current = [
        window.setTimeout(
          () => setThinkingState((current) => ({ ...current, status: "writing_answer" })),
          900
        ),
      ];
    }

    const optimisticUserMessage = {
      role: "user",
      content: messageToSend,
      documentId,
      documentName,
      createdAt: new Date().toISOString(),
    };

    setActiveConversation((current) =>
      current
        ? {
            ...current,
            messages: [...current.messages, optimisticUserMessage],
          }
        : {
            _id: activeConversationId || "pending",
            title: "New Chat",
            provider: "auto",
            messages: [optimisticUserMessage],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
    );

    try {
      const response = await chatService.sendMessage(
        messageToSend,
        activeConversationId,
        {
          selectedProvider: activePresetOption?.provider || "auto",
          selectedModelLevel: activePresetOption?.key || "auto",
          selectedModel: activePresetOption?.model || "",
          documentId,
          signal: abortControllerRef.current.signal,
        }
      );
      setSearchParams({ conversationId: response.data.conversationId });
      setActiveConversation(response.data.conversation);
      setUsage(response.data.usage);
      emitConversationRefresh();
      setAttachedFile(null);
      setAttachmentStatus("");
      setThinkingState({
        active: false,
        status: "thinking",
        usesWebSearch: false,
      });
    } catch (apiError) {
      if (apiError?.name === "CanceledError" || apiError?.code === "ERR_CANCELED") {
        setDraftMessage(messageToSend);
        return;
      }

      const usageData = apiError.response?.data?.usage || apiError.response?.data?.data;
      const retryAfterSeconds = apiError.response?.data?.retryAfterSeconds;
      const errorType = apiError.response?.data?.errorType;
      const provider = apiError.response?.data?.provider || apiError.response?.data?.data?.provider;

      if (usageData?.nextResetAt) {
        setUsage((currentUsage) => ({
          ...(currentUsage || {}),
          ...usageData,
        }));
      }

      const nextErrorMessage = getFriendlyAiErrorMessage(
        apiError,
        "AI could not respond right now. Please try again."
      );

      setError(nextErrorMessage);

      if (
        errorType === "provider_rate_limit" &&
        provider === "openrouter" &&
        retryAfterSeconds > 0
      ) {
        setProviderRateLimitUntil(Date.now() + retryAfterSeconds * 1000);
        getAiProviderStatus()
          .then((response) => setProviderStatus(response.data))
          .catch(() => {});
      } else {
        setProviderRateLimitUntil(null);
      }

      setActiveConversation((current) => {
        if (!current) {
          return null;
        }

        return {
          ...current,
          messages: current.messages.slice(0, -1),
        };
      });
      setDraftMessage(messageToSend);
    } finally {
      thinkingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      thinkingTimeoutsRef.current = [];
      setThinkingState({
        active: false,
        status: "thinking",
        usesWebSearch: false,
      });
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const handleProviderChange = (nextPreset) => {
    const normalizedPreset = normalizeModelPreset(nextPreset);
    setSelectedPreset(normalizedPreset);
    persistModelPreset(normalizedPreset);
    setError("");
    setProviderRateLimitUntil(null);
    getAiProviderStatus()
      .then((response) => setProviderStatus(response.data))
      .catch(() => {});
  };

  const handleRetryAfterError = () => {
    setError("");
    setProviderRateLimitUntil(null);

    if (draftMessage.trim()) {
      handleSend();
    }
  };

  const providerRateLimitCountdown = useMemo(() => {
    if (!providerRateLimitUntil) {
      return "";
    }

    const secondsLeft = Math.max(0, Math.ceil((providerRateLimitUntil - Date.now()) / 1000));
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    if (minutes <= 0) {
      return `${seconds}s`;
    }

    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }, [providerRateLimitUntil, providerRateLimitTick]);

  return (
    <>
      <section className="app-card flex h-full min-h-0 flex-col overflow-hidden rounded-[32px]">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6"
        >
          <div className="mx-auto max-w-[860px]">
            {searchOpen ? (
              <div className="mb-4 rounded-2xl border border-[var(--border)] bg-white/5 p-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search in this chat..."
                  className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                />
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p>{error}</p>
                    {providerRateLimitUntil ? (
                      <p className="mt-1 text-xs text-rose-200/80">
                        Retry unlocked in {providerRateLimitCountdown || "0s"}.
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRetryAfterError}
                    disabled={isSending}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            ) : null}

            {usage?.aiCredits === 0 ? (
              <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Your AI credits are finished. Please wait until credits renew in {usageCountdown}.
              </div>
            ) : null}

            {isLoadingMessages ? (
              <div className="space-y-4 py-4">
                <div className="flex gap-3">
                  <LoadingSkeleton className="h-8 w-8 rounded-xl" />
                  <div className="w-full max-w-2xl space-y-2">
                    <LoadingSkeleton className="h-4 w-32" />
                    <LoadingSkeleton className="h-4 w-full" />
                    <LoadingSkeleton className="h-4 w-5/6" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-full max-w-xl space-y-2">
                    <LoadingSkeleton className="ml-auto h-4 w-24" />
                    <LoadingSkeleton className="ml-auto h-4 w-full" />
                    <LoadingSkeleton className="ml-auto h-4 w-4/5" />
                  </div>
                </div>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="flex min-h-[62vh] flex-col items-center justify-center text-center">
                <div className="max-w-2xl">
                  <p className="app-kicker">SomuPilot</p>
                  <h2 className="mt-4 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                    How can SomuPilot help today?
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    Start with a prompt below or ask anything related to planning, writing,
                    notes, memory, tasks, or documents.
                  </p>
                </div>

                <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setDraftMessage(prompt);
                        handleSend(prompt);
                      }}
                      className="rounded-[24px] border border-[var(--border)] bg-white/5 px-5 py-4 text-left text-sm text-[var(--text-soft)] transition hover:border-[var(--border-strong)] hover:bg-white/8"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-24">
                {currentMessages.map((message, index) => (
                  (() => {
                    const isSearchMatch = !searchQuery.trim()
                      ? true
                      : String(message.content || "")
                          .toLowerCase()
                          .includes(searchQuery.trim().toLowerCase());
                    const previousMessage = currentMessages[index - 1];
                    const canRegenerate =
                      message.role === "assistant" && previousMessage?.role === "user";

                    return (
                  <ChatMessageBubble
                    key={`${message.createdAt || "message"}-${index}`}
                    message={message}
                    currentUserName={user?.name || "You"}
                    onEditRequest={handleEditRequest}
                    onAssistantUpdateRequest={handleAssistantUpdateRequest}
                    onDeleteRequest={handleDeleteMessageRequest}
                    onRegenerateRequest={handleRegenerate}
                    searchQuery={searchQuery}
                    isSearchMatch={isSearchMatch}
                    canRegenerate={canRegenerate}
                  />
                    );
                  })()
                ))}

                {isSending ? (
                  <ThinkingIndicator
                    status={thinkingState.status}
                    sourcesLoading={thinkingState.usesWebSearch}
                    webSearchEnabled={thinkingState.usesWebSearch}
                  />
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <ScrollToBottom
          scrollContainerRef={messagesContainerRef}
          onScrollToBottom={() => setIsNearBottom(true)}
        />

        <div className="shrink-0">
          <ChatComposer
            value={draftMessage}
            onChange={setDraftMessage}
            onSubmit={() => handleSend()}
            onProviderChange={handleProviderChange}
            selectedPreset={selectedPreset}
            isSending={isSending}
            disabled={isLoadingMessages || usage?.aiCredits === 0}
            helperText={
              usage?.aiCredits === 0
                ? `Credits renew in ${usageCountdown}.`
                : usage
                  ? `${usage.aiCredits}/${usage.maxAiCredits} AI credits available.`
                  : ""
            }
            usage={usage}
            usageCountdown={usageCountdown}
            onUsageUpdate={setUsage}
            providerStatus={providerStatus}
            onStop={handleStopGenerating}
            attachedFile={attachedFile}
            setAttachedFile={setAttachedFile}
            attachmentStatus={attachmentStatus}
            setAttachmentStatus={setAttachmentStatus}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>
      </section>

      {renameModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
          <div className="app-card w-full max-w-md rounded-[30px] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)]">Rename chat</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Give this conversation a clearer title.
            </p>
            <input
              type="text"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder="Enter chat title"
              className="app-input mt-5"
              maxLength={120}
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setRenameModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameConversation} disabled={!renameValue.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete chat"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        onConfirm={handleDeleteConversation}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}

export default ChatPage;
