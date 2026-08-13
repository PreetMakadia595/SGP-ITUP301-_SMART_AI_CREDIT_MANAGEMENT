/**
 * TypeScript Interfaces for AI Platform Management
 */

export interface SupportedPlatform {
  name: string;
  slug: string;
  color: string;
  default_plan: string;
  default_cost: number;
  default_credits: number;
  description: string;
}

export type PlatformStatus = "Active" | "Inactive" | "active" | "warning" | "expired" | "paused";

export interface UserPlatform {
  id: number;
  user_id: number;
  platform_name: string;
  subscription_plan: string;
  monthly_credits: number;
  remaining_credits: number;
  renewal_date: string;
  monthly_cost: number;
  masked_api_key?: string | null;
  status: PlatformStatus | string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformCreatePayload {
  platform_name: string;
  subscription_plan: string;
  monthly_credits?: number;
  remaining_credits?: number;
  renewal_date: string;
  monthly_cost: number;
  api_key?: string;
  status?: string;
  notes?: string;
}

export interface PlatformUpdatePayload {
  platform_name?: string;
  subscription_plan?: string;
  monthly_credits?: number;
  remaining_credits?: number;
  renewal_date?: string;
  monthly_cost?: number;
  api_key?: string;
  status?: string;
  notes?: string;
}

export interface PlatformRevealKeyResponse {
  id: number;
  platform_name: string;
  api_key?: string | null;
}
