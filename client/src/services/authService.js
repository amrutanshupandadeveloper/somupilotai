import api from "./api";

const register = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

const login = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export { register, login, getMe, logout };
