import { createContext, useEffect, useState } from "react";
import { AUTH_TOKEN_KEY } from "../services/api";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
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
    } catch (_error) {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    persistAuth(response.data);
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    persistAuth(response.data);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
