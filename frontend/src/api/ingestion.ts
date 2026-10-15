/**
 * Data Synchronization & Ingestion API Client
 */
import { apiClient } from "./client";

export interface DataSourceBreakdown {
  total_events: number;
  sources: {
    source: string;
    count: number;
    percentage: number;
  }[];
}

export interface IngestedEvent {
  id: number;
  source_type: string;
  platform: string;
  model: string;
  duration_seconds: number;
  prompt_count: number;
  credits_used: number;
  cost_usd: number;
  usage_date: string;
  website_url?: string;
  created_at: string;
}

export interface ManualIngestionPayload {
  platform: string;
  model: string;
  credits_used: number;
  prompt_count: number;
  usage_date: string;
  notes?: string;
}

export async function getDataSourceBreakdown(): Promise<DataSourceBreakdown> {
  const { data } = await apiClient.get<DataSourceBreakdown>("/ingestion/source-breakdown");
  return data;
}

export async function getLatestEvents(limit: number = 10): Promise<IngestedEvent[]> {
  const { data } = await apiClient.get<IngestedEvent[]>(`/ingestion/latest-events?limit=${limit}`);
  return data;
}

export async function ingestManualEntry(payload: ManualIngestionPayload): Promise<any> {
  const { data } = await apiClient.post("/ingestion/manual", payload);
  return data;
}

import { MLPredictionsResponse } from "@/types/ml";

export async function getMLAnalytics(): Promise<any> {
  const { data } = await apiClient.get("/analytics/ml");
  return data;
}

export async function getSmartPredictions(): Promise<MLPredictionsResponse> {
  const { data } = await apiClient.get<MLPredictionsResponse>("/analytics/predictions");
  return data;
}
