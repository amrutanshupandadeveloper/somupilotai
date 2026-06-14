import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import ChatComposer from "../components/ChatComposer";
import ChatMessageBubble from "../components/ChatMessageBubble";
import ThinkingIndicator from "../components/ThinkingIndicator";
import ScrollToBottom from "../components/ScrollToBottom";
import { useAuth } from "../hooks/useAuth";
import * as chatService from "../services/chatService";
import { getFriendlyAiErrorMessage } from "../utils/aiError";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const suggestedPrompts = [
  "Plan my study day",
  "Summarize my notes",
  "Create a task",
  "Ask from a PDF",
];

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
  onRename,
  onTogglePin,
  onDelete,
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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const activeConversationId = searchParams.get("conversationId");
  const currentMessages = activeConversation?.messages || [];

  const conversationText = useMemo(
    () =>
      currentMessages
        .map((message) => `${message.role === "assistant" ? "SomuPilot" : user?.name || "You"}: ${message.content}`)
        .join("\n\n"),
    [currentMessages, user?.name]
  );

  useEffect(() => {
    refreshUsageSafely().catch(() => {});
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastMessage(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

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
          onRename={() => {
            setRenameValue(activeConversation?.title || "");
            setRenameModalOpen(true);
          }}
          onTogglePin={handleTogglePin}
          onDelete={() => setDeleteModalOpen(true)}
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

    if (!prefilledMessage) {
      setDraftMessage("");
    }

    setIsSending(true);
    setError("");

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
      const selectedModel = localStorage.getItem("somupilot_ai_model_preference") || "Auto";
      const response = await chatService.sendMessage(messageToSend, activeConversationId, selectedModel, documentId);
      setSearchParams({ conversationId: response.data.conversationId });
      setActiveConversation(response.data.conversation);
      setUsage(response.data.usage);
      emitConversationRefresh();
      setAttachedFile(null);
      setAttachmentStatus("");
    } catch (apiError) {
      const usageData = apiError.response?.data?.usage || apiError.response?.data?.data;

      if (usageData?.nextResetAt) {
        setUsage((currentUsage) => ({
          ...(currentUsage || {}),
          ...usageData,
        }));
      }

      setError(
        getFriendlyAiErrorMessage(
          apiError,
          "AI could not respond right now. Please try again."
        )
      );
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
      setIsSending(false);
    }
  };

  return (
    <>
      <section className="app-card flex h-full min-h-0 flex-col overflow-hidden rounded-[32px]">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6"
        >
          <div className="mx-auto max-w-[860px]">
            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
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

                <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
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
                  <ChatMessageBubble
                    key={`${message.createdAt || "message"}-${index}`}
                    message={message}
                    currentUserName={user?.name || "You"}
                  />
                ))}

                {isSending ? <ThinkingIndicator /> : null}

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
