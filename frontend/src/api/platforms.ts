/**
 * Platform API Endpoints Client
 */
import { apiClient } from "./client";
import {
  SupportedPlatform,
  UserPlatform,
  PlatformCreatePayload,
  PlatformUpdatePayload,
  PlatformRevealKeyResponse,
} from "@/types/platform";

export const getSupportedPlatforms = async (): Promise<SupportedPlatform[]> => {
  const res = await apiClient.get<SupportedPlatform[]>("/platforms/supported");
  return res.data;
};

export const getUserPlatforms = async (
  search?: string,
  status_filter?: string
): Promise<UserPlatform[]> => {
  const params: Record<string, string> = {};
  if (search && search.trim()) params.search = search.trim();
  if (status_filter && status_filter !== "all") params.status_filter = status_filter;
  
  const res = await apiClient.get<UserPlatform[]>("/platforms", { params });
  return res.data;
};

export const createPlatform = async (
  payload: PlatformCreatePayload
): Promise<UserPlatform> => {
  const res = await apiClient.post<UserPlatform>("/platforms", payload);
  return res.data;
};

export const getPlatformById = async (id: number): Promise<UserPlatform> => {
  const res = await apiClient.get<UserPlatform>(`/platforms/${id}`);
  return res.data;
};

export const updatePlatform = async (
  id: number,
  payload: PlatformUpdatePayload
): Promise<UserPlatform> => {
  const res = await apiClient.put<UserPlatform>(`/platforms/${id}`, payload);
  return res.data;
};

export const deletePlatform = async (id: number): Promise<{ message: string; id: number }> => {
  const res = await apiClient.delete<{ message: string; id: number }>(`/platforms/${id}`);
  return res.data;
};

export const revealPlatformApiKey = async (
  id: number
): Promise<PlatformRevealKeyResponse> => {
  const res = await apiClient.get<PlatformRevealKeyResponse>(`/platforms/${id}/reveal-key`);
  return res.data;
};
