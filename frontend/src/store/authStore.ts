/**
 * Auth Store (Zustand)
 * Persists user and tokens in localStorage.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthTokens } from "@/types/auth";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        set({ user, tokens, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    { name: "auth-store", partialize: (s) => ({ user: s.user, tokens: s.tokens, isAuthenticated: s.isAuthenticated }) }
  )
);
