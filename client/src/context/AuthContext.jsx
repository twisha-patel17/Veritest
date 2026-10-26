
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem("veritest_access_token")
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAccessToken = useCallback((token) => {
    sessionStorage.setItem("veritest_access_token", token);
    setAccessToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem("veritest_access_token");
    setAccessToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post("/auth/login", credentials);
      const { accessToken: token, user: loggedInUser } = response.data;

      if (!token) {
        throw new Error("The server did not return an access token.");
      }

      saveAccessToken(token);
      setUser(loggedInUser || null);

      return response.data;
    },
    [saveAccessToken]
  );

  const register = useCallback(
    async (details) => {
      const response = await api.post("/auth/register", details);
      const { accessToken: token, user: registeredUser } = response.data;

      if (!token) {
        throw new Error("The server did not return an access token.");
      }

      saveAccessToken(token);
      setUser(registeredUser || null);

      return response.data;
    },
    [saveAccessToken]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refresh = useCallback(async () => {
    try {
      const response = await api.post("/auth/refresh");
      const token = response.data.accessToken;

      if (!token) {
        throw new Error("The server did not return an access token.");
      }

      saveAccessToken(token);
      return token;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [clearAuth, saveAccessToken]);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        let token = sessionStorage.getItem("veritest_access_token");

        if (!token) {
          const response = await api.post("/auth/refresh");
          token = response.data.accessToken;

          if (token) {
            saveAccessToken(token);
          }
        }

        if (!token) {
          return;
        }

        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          setUser(response.data.user);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [clearAuth, saveAccessToken]);

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: Boolean(accessToken && user),
    login,
    register,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
