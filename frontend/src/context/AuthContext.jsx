import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("carebridge_user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("carebridge_user");
      localStorage.removeItem("carebridge_token");
      return null;
    }
  });

  // Login
  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const { token, user } = response.data;

    localStorage.setItem("carebridge_token", token);
    localStorage.setItem("carebridge_user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  // Register
  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);

    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("carebridge_token");
    localStorage.removeItem("carebridge_user");

    setUser(null);
  };

  const value = {
    user,
    loading: false,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom authentication hook
// eslint-disable-next-line react-refresh/only-export-components -- keep the hook with its context.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
