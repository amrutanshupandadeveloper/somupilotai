import api from "./api";

const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

const updateAdminUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

const updateAdminUserStatus = async (userId, status) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { status });
  return response.data;
};

const updateAdminUserCredits = async (userId, payload) => {
  const response = await api.patch(`/admin/users/${userId}/credits`, payload);
  return response.data;
};

const resetAdminUserCredits = async (userId) => {
  const response = await api.post(`/admin/users/${userId}/reset-credits`);
  return response.data;
};

const getAdminAiStatus = async () => {
  const response = await api.get("/admin/ai-status");
  return response.data;
};

const getAdminUsage = async () => {
  const response = await api.get("/admin/usage");
  return response.data;
};

const getAdminAuditLogs = async (params = {}) => {
  const response = await api.get("/admin/audit-logs", { params });
  return response.data;
};

export {
  getAdminAiStatus,
  getAdminAuditLogs,
  getAdminStats,
  getAdminUsage,
  getAdminUsers,
  resetAdminUserCredits,
  updateAdminUserCredits,
  updateAdminUserRole,
  updateAdminUserStatus,
};
