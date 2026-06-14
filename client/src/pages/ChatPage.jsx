import { useEffect, useRef, useState } from "react";
import ChatComposer from "../components/ChatComposer";
import ChatMessageBubble from "../components/ChatMessageBubble";
import * as chatService from "../services/chatService";

function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const messagesEndRef = useRef(null);

  const currentMessages = activeConversation?.messages || [];

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoadingConversations(true);
      setError("");

      try {
        const response = await chatService.getConversations();
        setConversations(response.data);

        if (response.data.length > 0) {
          setActiveConversationId(response.data[0]._id);
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Unable to load conversations");
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isSending]);

  const refreshConversations = async (preferredConversationId = null) => {
    const response = await chatService.getConversations();
    setConversations(response.data);

    if (preferredConversationId) {
      setActiveConversationId(preferredConversationId);
      return;
    }

    if (response.data.length === 0) {
      setActiveConversationId(null);
      setActiveConversation(null);
      return;
    }

    const stillExists = response.data.some(
      (conversation) => conversation._id === activeConversationId
    );

    if (!stillExists) {
      setActiveConversationId(response.data[0]._id);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setActiveConversation(null);
    setDraftMessage("");
    setError("");
  };

  const handleSend = async () => {
    if (!draftMessage.trim() || isSending) {
      return;
    }

    const messageToSend = draftMessage;
    setDraftMessage("");
    setIsSending(true);
    setError("");

    const optimisticUserMessage = {
      role: "user",
      content: messageToSend.trim(),
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
            provider: "gemini",
            messages: [optimisticUserMessage],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
    );

    try {
      const response = await chatService.sendMessage(messageToSend, activeConversationId);
      setActiveConversationId(response.data.conversationId);
      setActiveConversation(response.data.conversation);
      await refreshConversations(response.data.conversationId);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to send message");
      setActiveConversation((current) => {
        if (!current) {
          return null;
        }

        const nextMessages = current.messages.slice(0, -1);

        return {
          ...current,
          messages: nextMessages,
        };
      });
      setDraftMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      setError("");
      await chatService.deleteConversation(conversationId);
      const remainingConversations = conversations.filter(
        (conversation) => conversation._id !== conversationId
      );
      setConversations(remainingConversations);

      if (activeConversationId === conversationId) {
        const nextId = remainingConversations[0]?._id || null;
        setActiveConversationId(nextId);
        if (!nextId) {
          setActiveConversation(null);
        }
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to delete conversation");
    }
  };

  const handleRenameConversation = async (conversationId) => {
    const nextTitle = renameValue.trim();

    if (!nextTitle) {
      setRenameId(null);
      setRenameValue("");
      return;
    }

    try {
      setError("");
      const response = await chatService.updateConversationTitle(conversationId, nextTitle);
      setConversations((current) =>
        current.map((conversation) =>
          conversation._id === conversationId ? { ...conversation, ...response.data } : conversation
        )
      );

      if (activeConversation?._id === conversationId) {
        setActiveConversation((current) =>
          current ? { ...current, title: response.data.title } : current
        );
      }

      setRenameId(null);
      setRenameValue("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to rename conversation");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
        <div className="border-b border-white/10 p-5">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            New Chat
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
          {isLoadingConversations ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
              No saved conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive = activeConversationId === conversation._id;

              return (
                <div
                  key={conversation._id}
                  className={`rounded-2xl border p-4 transition ${
                    isActive
                      ? "border-sky-300/50 bg-sky-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {renameId === conversation._id ? (
                    <div className="space-y-3">
                      <input
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRenameConversation(conversation._id)}
                          className="rounded-xl bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameId(null);
                            setRenameValue("");
                          }}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveConversationId(conversation._id)}
                        className="w-full text-left"
                      >
                        <p className="truncate text-sm font-semibold text-white">
                          {conversation.title}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                          {conversation.lastMessagePreview || "No messages yet"}
                        </p>
                      </button>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRenameId(conversation._id);
                            setRenameValue(conversation.title);
                          }}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteConversation(conversation._id)}
                          className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex min-h-[75vh] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300">SomuPilot Chat</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {activeConversation?.title || "New conversation"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Loading conversation...
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="max-w-lg rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-6 py-10">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-300">
                  SomuPilot AI
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Start a conversation with SomuPilot
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Ask for help with planning, learning, writing, or productivity.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentMessages.map((message, index) => (
                <ChatMessageBubble
                  key={`${message.createdAt || "message"}-${index}`}
                  message={message}
                />
              ))}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    SomuPilot is thinking...
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatComposer
          value={draftMessage}
          onChange={setDraftMessage}
          onSubmit={handleSend}
          isSending={isSending}
          disabled={isLoadingMessages}
        />
      </section>
    </div>
  );
}

export default ChatPage;
