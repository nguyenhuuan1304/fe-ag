import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { handleLoginSuccess } from "../lib/axios";

type AuthContextType = {
  token: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const navigate = useNavigate();

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    handleLoginSuccess(accessToken, refreshToken); // Start refresh cycle
    navigate("/dashboard"); // Redirect to dashboard after login
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // Call backend logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken"); // Clear refresh token
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
