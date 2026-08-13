/**
 * Usage Tracker API Client
 *
 * Wraps /analytics/usage-summary and re-uses existing ingestion endpoints.
 */
import { apiClient } from "./client";
export { getLatestEvents, ingestManualEntry, getDataSourceBreakdown } from "./ingestion";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PeriodStats {
  credits: number;
  prompts: number;
  tokens: number;
  sessions: number;
  cost_usd: number;
  duration_seconds: number;
}

export interface PlatformStat {
  platform: string;
  credits: number;
  prompts: number;
  sessions: number;
}

export interface TaskStat {
  task_type: string;
  count: number;
}

export interface SourceBreakdown {
  manual_entry: number;
  official_api: number;
  browser_extension: number;
  [key: string]: number;
}

export interface UsageSummary {
  today: PeriodStats;
  this_week: PeriodStats;
  this_month: PeriodStats;
  total: PeriodStats;
  most_used_ai: string | null;
  favorite_ai: string | null;
  source_breakdown: SourceBreakdown;
  platform_distribution: PlatformStat[];
  task_distribution: TaskStat[];
  period: {
    today: string;
    week_start: string;
    month_start: string;
  };
}

// ── API Calls ─────────────────────────────────────────────────────────────────

/** Fetch aggregated usage summary (today / week / month / total + AI stats) */
export async function getUsageSummary(): Promise<UsageSummary> {
  const { data } = await apiClient.get<UsageSummary>("/analytics/usage-summary");
  return data;
}
