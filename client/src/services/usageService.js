import api from "./api";

const getUsage = async () => {
  const response = await api.get("/usage");
  return response.data;
};

const resetUsageDev = async () => {
  const response = await api.post("/usage/reset-dev");
  return response.data;
};

export { getUsage, resetUsageDev };
