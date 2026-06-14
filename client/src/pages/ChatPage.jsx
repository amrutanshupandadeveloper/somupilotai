import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatComposer from "../components/ChatComposer";
import ChatMessageBubble from "../components/ChatMessageBubble";
import ThinkingIndicator from "../components/ThinkingIndicator";
import ScrollToBottom from "../components/ScrollToBottom";
import { useAuth } from "../hooks/useAuth";
import * as chatService from "../services/chatService";
import { getFriendlyAiErrorMessage } from "../utils/aiError";
import { getUsageToneClasses } from "../utils/usage";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";

const suggestedPrompts = [
  "Plan my study day",
  "Summarize my notes",
  "Create a task",
  "Ask from a PDF",
];

function ChatPage() {
  const { user, usage, usageCountdown, setUsage, refreshUsageSafely } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConversation, setActiveConversation] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const activeConversationId = searchParams.get("conversationId");
  const currentMessages = activeConversation?.messages || [];

  useEffect(() => {
    refreshUsageSafely().catch(() => {});
  }, []);

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
    if (!container) return;

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
  }, [messagesContainerRef]);

  const handleSend = async (prefilledMessage = null) => {
    const messageToSend = (prefilledMessage ?? draftMessage).trim();

    if (!messageToSend || isSending) {
      return;
    }

    if (!prefilledMessage) {
      setDraftMessage("");
    }

    setIsSending(true);
    setError("");

    const optimisticUserMessage = {
      role: "user",
      content: messageToSend,
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
      const response = await chatService.sendMessage(messageToSend, activeConversationId);
      setSearchParams({ conversationId: response.data.conversationId });
      setActiveConversation(response.data.conversation);
      setUsage(response.data.usage);
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
    <section className="app-card flex h-full min-h-0 flex-col overflow-hidden rounded-[32px]">
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-[860px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-kicker">SomuPilot Chat</p>
              <h1 className="mt-3 text-2xl font-semibold text-[var(--text)]">
                {activeConversation?.title || "How can SomuPilot help today?"}
              </h1>
            </div>
            {usage ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${getUsageToneClasses(
                  usage.aiCredits
                )}`}
              >
                <p className="font-semibold">
                  {usage.aiCredits}/{usage.maxAiCredits} credits
                </p>
                <p className="mt-1 text-xs opacity-80">Renews in {usageCountdown}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6">
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
            <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
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
        />
      </div>
    </section>
  );
}

export default ChatPage;
