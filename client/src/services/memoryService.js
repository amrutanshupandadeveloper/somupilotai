import api from "./api";

export const memoryService = {
  createMemory: async (data) => {
    const response = await api.post("/memories", data);
    return response.data;
  },

  getMemories: async (params = {}) => {
    const response = await api.get("/memories", { params });
    return response.data;
  },

  getMemoryById: async (id) => {
    const response = await api.get(`/memories/${id}`);
    return response.data;
  },

  updateMemory: async (id, data) => {
    const response = await api.put(`/memories/${id}`, data);
    return response.data;
  },

  deleteMemory: async (id) => {
    const response = await api.delete(`/memories/${id}`);
    return response.data;
  },

  restoreMemory: async (id) => {
    const response = await api.patch(`/memories/${id}/restore`);
    return response.data;
  },
};
