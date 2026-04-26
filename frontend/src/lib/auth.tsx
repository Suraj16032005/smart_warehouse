import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "./api/authApi";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    // If token exists but no user info, we might decode it or try to fetch profile.
    // For now, if we have a token, we assume authenticated.
    // Real apps might verify token on load.
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: any) => {
    const data = await authApi.login(credentials);
    // Backend returns token. We can store it.
    localStorage.setItem("token", data.token);
    setToken(data.token);
    // Our simplistic backend currently doesn't return full user object on login, just token.
    // We'll stub a basic user object from email just for display if needed.
    const mockUser = { id: 0, name: "Operator", email: credentials.email };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const register = async (data: any) => {
    await authApi.register(data);
    // After registration, user goes to login page.
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
