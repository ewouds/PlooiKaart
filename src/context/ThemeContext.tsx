import { ThemeProvider } from "@mui/material";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { getTheme } from "../theme";
import { useAuth } from "./AuthContext";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeContextProvider");
  }
  return context;
};

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    if (user?.theme) {
      setMode(user.theme);
    }
  }, [user]);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    if (user) {
      client.patch("/users/me/theme", { theme: newMode }).catch(console.error);
    }
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
