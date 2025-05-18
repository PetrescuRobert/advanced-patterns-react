import { createContext, ReactNode, use, useEffect, useState } from "react";
import { getItem, setItem } from "@/lib/utils/localStorage.ts";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const ThemeContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    getItem(storageKey) ?? defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("{prefers-color-scheme: dark}")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      setItem(storageKey, theme);
      return;
    }

    root.classList.add(theme);
    setItem(storageKey, theme);
  }, [theme, storageKey]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export const useTheme = () => {
  const context = use(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
