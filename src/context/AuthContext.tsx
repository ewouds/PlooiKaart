import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

interface User {
  _id: string;
  displayName: string;
  username: string;
  email: string;
  isPilot: boolean;
  theme?: "light" | "dark";
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    client
      .get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData: User, token?: string) => {
    if (token) localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await client.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
