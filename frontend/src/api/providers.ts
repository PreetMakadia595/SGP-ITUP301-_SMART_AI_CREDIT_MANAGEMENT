/**
 * Official AI Providers & Sync API Client
 */
import { apiClient } from "./client";

export interface ProviderStatus {
  provider_slug: string;
  provider_name: string;
  is_connected: boolean;
  status: string;
  masked_key?: string;
  last_sync_at?: string;
  last_sync_status: string;
  supports_billing_api: boolean;
  billing_status: string;
  available_models: string[];
}

export interface SyncResponse {
  success: boolean;
  provider_slug: string;
  records_ingested: number;
  billing_status: string;
  message?: string;
  models: string[];
}

export interface SyncHistoryItem {
  id: number;
  provider_slug: string;
  source_type: string;
  status: string;
  records_ingested: number;
  details?: string;
  sync_time: string;
}

export async function getProvidersStatus(): Promise<ProviderStatus[]> {
  const { data } = await apiClient.get<ProviderStatus[]>("/providers/status");
  return data;
}

export async function connectProvider(providerSlug: string, apiKey: string, autoSync: boolean = true): Promise<any> {
  const { data } = await apiClient.post("/providers/connect", {
    provider_slug: providerSlug,
    api_key: apiKey,
    auto_sync_enabled: autoSync,
  });
  return data;
}

export async function disconnectProvider(providerSlug: string): Promise<any> {
  const { data } = await apiClient.post("/providers/disconnect", {
    provider_slug: providerSlug,
  });
  return data;
}

export async function syncSingleProvider(providerSlug: string): Promise<SyncResponse> {
  const { data } = await apiClient.post<SyncResponse>(`/providers/sync/${providerSlug}`);
  return data;
}

export async function syncAllProviders(): Promise<SyncResponse[]> {
  const { data } = await apiClient.post<SyncResponse[]>("/providers/sync-all");
  return data;
}

export async function getSyncHistory(): Promise<SyncHistoryItem[]> {
  const { data } = await apiClient.get<SyncHistoryItem[]>("/providers/history");
  return data;
}
