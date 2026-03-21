import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../configs/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoggedIn(true);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
          setUser(null);
          setLoggedIn(false);
        }
      } else {
        setUser(null);
        setLoggedIn(false);
      }
      setLoading(false);
    };

    loadUser();

    const handleStorageChange = (e) => {
      if (e.key === "user") loadUser();
    };

    window.addEventListener("storage", handleStorageChange);
    const handleCustomStorageChange = () => loadUser();
    window.addEventListener("userStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userStorageChange", handleCustomStorageChange);
    };
  }, []);

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post("/api/auth/register", { name, email, password });
      return { success: true };
    } catch (error) {
      const errorMsg = error.message || "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      if (response.twoFactorRequired) {
        return { success: true, twoFactorRequired: true, userId: response.userId };
      }
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      setLoggedIn(true);
      return { success: true, role: response.user.role };
    } catch (error) {
      const errorMsg = error.message || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/logout");
      setUser(null);
      localStorage.removeItem("user");
      setLoggedIn(false);
      window.dispatchEvent(new Event("userStorageChange"));
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user");
      setLoggedIn(false);
      window.dispatchEvent(new Event("userStorageChange"));
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (token, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/auth/2fa/verify", { token, userId });
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      setLoggedIn(true);
      return { success: true, role: response.user.role };
    } catch (error) {
      const errorMsg = error.message || "2FA Verification failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/auth/2fa/setup");
      return { success: true, data: response };
    } catch (error) {
      const errorMsg = error.message || "2FA Setup failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post("/api/auth/2fa/disable");
      const updatedUser = { ...user, isTwoFactorEnabled: false };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const errorMsg = error.message || "Disabling 2FA failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateModules = async (enabledModules) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put("/api/auth/modules", { enabledModules });
      const updatedUser = { ...user, enabledModules: response.enabledModules };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const errorMsg = error.message || "Failed to update modules";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getAdminLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/auth/admin/logs");
      return { success: true, data: response };
    } catch (error) {
      const errorMsg = error.message || "Failed to fetch admin logs";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, error, register, login, logout, 
      loggedIn, verify2FA, setup2FA, disable2FA, updateModules,
      getAdminLogs
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
