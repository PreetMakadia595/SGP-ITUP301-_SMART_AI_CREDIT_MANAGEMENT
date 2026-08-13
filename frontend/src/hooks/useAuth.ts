/**
 * useAuth Hook — Complete Authentication & User Profile Management
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  User,
  ForgotPasswordResponse,
  MessageResponse,
  UpdateProfileRequest,
} from "@/types/auth";

export function useAuth() {
  const { setAuth, clearAuth, setUser, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await apiClient.post<AuthTokens>("/auth/login", data);
      const tokens = res.data;
      const meRes = await apiClient.get<User>("/users/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      setAuth(meRes.data, tokens);
      navigate("/");
    },
    [setAuth, navigate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await apiClient.post<AuthTokens>("/auth/register", data);
      const tokens = res.data;
      const meRes = await apiClient.get<User>("/users/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      setAuth(meRes.data, tokens);
      navigate("/");
    },
    [setAuth, navigate]
  );

  const googleLogin = useCallback(
    async (email?: string, full_name?: string) => {
      const res = await apiClient.post<AuthTokens>("/auth/google", {
        email,
        full_name,
      });
      const tokens = res.data;
      const meRes = await apiClient.get<User>("/users/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      setAuth(meRes.data, tokens);
      navigate("/");
    },
    [setAuth, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
      navigate("/login");
    }
  }, [clearAuth, navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (token: string, new_password: string) => {
    const res = await apiClient.post<MessageResponse>("/auth/reset-password", {
      token,
      new_password,
    });
    return res.data;
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      const res = await apiClient.put<User>("/auth/profile", data);
      setUser(res.data);
      return res.data;
    },
    [setUser]
  );

  const changePassword = useCallback(async (current_password: string, new_password: string) => {
    const res = await apiClient.post<MessageResponse>("/auth/change-password", {
      current_password,
      new_password,
    });
    return res.data;
  }, []);

  const fetchMe = useCallback(async () => {
    const res = await apiClient.get<User>("/users/me");
    setUser(res.data);
    return res.data;
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    login,
    googleLogin,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    fetchMe,
  };
}
