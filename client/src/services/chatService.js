import api from "./api";

const sendMessage = async (message, conversationId, model, documentId, options = {}) => {
  const response = await api.post("/chat", {
    message,
    conversationId,
    model,
    documentId,
  }, {
    signal: options.signal,
  });

  return response.data;
};

const getConversations = async () => {
  const response = await api.get("/chat/conversations");
  return response.data;
};

const getConversation = async (id) => {
  const response = await api.get(`/chat/conversations/${id}`);
  return response.data;
};

const deleteConversation = async (id) => {
  const response = await api.delete(`/chat/conversations/${id}`);
  return response.data;
};

const updateConversationTitle = async (id, title) => {
  const response = await api.patch(`/chat/conversations/${id}/title`, { title });
  return response.data;
};

const toggleConversationPin = async (id) => {
  const response = await api.patch(`/chat/conversations/${id}/pin`);
  return response.data;
};

export {
  deleteConversation,
  getConversation,
  getConversations,
  sendMessage,
  toggleConversationPin,
  updateConversationTitle,
};
