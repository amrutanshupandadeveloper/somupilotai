import axios from "axios";

const AUTH_TOKEN_KEY = "somupilot_ai_token";
const defaultApiBaseUrl = `http://${window.location.hostname}:5000/api`;

let baseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;
if (baseUrl && !baseUrl.endsWith("/api") && !baseUrl.endsWith("/api/")) {
  baseUrl = baseUrl.replace(/\/$/, "") + "/api";
}

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { AUTH_TOKEN_KEY };
export default api;
