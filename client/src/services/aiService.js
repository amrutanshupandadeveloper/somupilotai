import api from "./api";

const getAiProviderStatus = async () => {
  const response = await api.get("/ai/status");
  return response.data;
};

export { getAiProviderStatus };
