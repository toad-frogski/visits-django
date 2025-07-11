import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

type ThemeMode = "dark" | "light" | "system";
type ThemeVariant = string;

type Theme = {
  mode: ThemeMode;
  variant: ThemeVariant;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: { mode: "system", variant: "default" },
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = initialState.theme,
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored) as Theme;
      } catch {
        return defaultTheme;
      }
    }

    return defaultTheme;
  });

  const resolveMode = (mode: ThemeMode): "dark" | "light" => {
    if (mode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return mode;
  };

  useLayoutEffect(() => {
    const root = window.document.documentElement;

    const mode = resolveMode(theme.mode);
    if (theme.mode === "system") {
      setTheme({...theme, mode: mode});
      return;
    }

    root.dataset.mode = mode;
    root.dataset.variant = theme.variant;
  }, [theme]);

  const updateTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, JSON.stringify(theme));
    setTheme(theme);
  };

  const value = { theme, setTheme: updateTheme };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
