/**
 * Credit Logs API endpoints client
 */
import { apiClient } from "@/api/client";
import type {
  CreditUsageLog,
  CreditUsageLogCreate,
  CreditUsageLogUpdate,
  CreditLogFilters,
  CreditLogListResponse,
  CreditChartsResponse,
} from "@/types/credit";

export async function fetchCreditLogs(filters?: CreditLogFilters): Promise<CreditLogListResponse> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.platform && filters.platform !== "All") params.append("platform", filters.platform);
  if (filters?.task_type && filters.task_type !== "All") params.append("task_type", filters.task_type);
  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);
  if (filters?.skip !== undefined) params.append("skip", filters.skip.toString());
  if (filters?.limit !== undefined) params.append("limit", filters.limit.toString());

  const response = await apiClient.get<CreditLogListResponse>(`/credits/logs/?${params.toString()}`);
  return response.data;
}

export async function createCreditLog(data: CreditUsageLogCreate): Promise<CreditUsageLog> {
  const response = await apiClient.post<CreditUsageLog>("/credits/logs/", data);
  return response.data;
}

export async function updateCreditLog(id: number, data: CreditUsageLogUpdate): Promise<CreditUsageLog> {
  const response = await apiClient.put<CreditUsageLog>(`/credits/logs/${id}`, data);
  return response.data;
}

export async function deleteCreditLog(id: number): Promise<void> {
  await apiClient.delete(`/credits/logs/${id}`);
}

export async function fetchCreditCharts(): Promise<CreditChartsResponse> {
  const response = await apiClient.get<CreditChartsResponse>("/credits/logs/charts");
  return response.data;
}
