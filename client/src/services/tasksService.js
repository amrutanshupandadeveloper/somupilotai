import api from "./api";

export const tasksService = {
  createTask: async (data) => {
    const response = await api.post("/tasks", data);
    return response.data;
  },

  getTasks: async (params = {}) => {
    const response = await api.get("/tasks", { params });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  completeTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
  },

  reopenTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/reopen`);
    return response.data;
  },
};
