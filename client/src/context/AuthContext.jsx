import { createContext, useEffect, useState } from "react";
import { AUTH_TOKEN_KEY } from "../services/api";
import * as authService from "../services/authService";
import * as usageService from "../services/usageService";
import { formatTimeUntilReset } from "../utils/usage";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [usage, setUsage] = useState(null);
  const [usageCountdown, setUsageCountdown] = useState("0m");
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = (authPayload) => {
    const nextToken = authPayload?.token || "";
    const nextUser = authPayload?.user || null;

    if (nextToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    setToken(nextToken || null);
    setUser(nextUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setUsage(null);
    setUsageCountdown("0m");
  };

  const applyUsage = (usageData) => {
    const resolvedUsage =
      typeof usageData === "function" ? usageData(usage) : usageData;

    if (!resolvedUsage) {
      setUsage(null);
      setUsageCountdown("0m");
      return;
    }

    setUsage(resolvedUsage);
    setUsageCountdown(formatTimeUntilReset(resolvedUsage.nextResetAt));
  };

  const refreshUsage = async () => {
    const response = await usageService.getUsage();
    applyUsage(response.data);
    return response.data;
  };

  const refreshUsageSafely = async () => {
    try {
      return await refreshUsage();
    } catch (_error) {
      applyUsage(null);
      return null;
    }
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!storedToken) {
      clearAuth();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.getMe();
      setToken(storedToken);
      setUser(response.data);
      await refreshUsageSafely();
    } catch (_error) {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    persistAuth(response.data);
    await refreshUsageSafely();
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    persistAuth(response.data);
    await refreshUsageSafely();
    return response;
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (_error) {
      // Client-side logout should still succeed if the API call fails.
    } finally {
      clearAuth();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!usage?.nextResetAt || !token) {
      return undefined;
    }

    const interval = setInterval(() => {
      const nextCountdown = formatTimeUntilReset(usage.nextResetAt);
      setUsageCountdown(nextCountdown);

      if (nextCountdown === "0m") {
        refreshUsageSafely().catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [usage?.nextResetAt, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        usage,
        usageCountdown,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        logout,
        checkAuth,
        refreshUsage,
        refreshUsageSafely,
        setUsage: applyUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
