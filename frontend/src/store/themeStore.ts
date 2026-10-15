/**
 * Theme Store — Zustand state for Light / Dark / System mode management
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const applyThemeToDOM = (theme: ThemeMode) => {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme: ThemeMode) => {
        applyThemeToDOM(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const current = get().theme;
        const next: ThemeMode = current === "dark" ? "light" : "dark";
        applyThemeToDOM(next);
        set({ theme: next });
      },
    }),
    {
      name: "sgp-ai-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);

// Initialize on script load
if (typeof window !== "undefined") {
  const initialTheme =
    (localStorage.getItem("sgp-ai-theme")
      ? JSON.parse(localStorage.getItem("sgp-ai-theme")!).state?.theme
      : "dark") || "dark";
  applyThemeToDOM(initialTheme);
}
