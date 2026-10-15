/**
 * AI Budget Planner API Client
 */
import { apiClient } from "./client";

export interface BudgetPlannerInput {
  monthly_budget: number;
  preferred_platforms: string[];
  usage_frequency: string;
  primary_tasks: string[];
  current_platform_ids?: number[];
}

export interface SubscriptionRecommendation {
  platform_name: string;
  tier_name: string;
  monthly_cost: number;
  is_free_tier: boolean;
  best_for: string;
  key_features: string[];
  badge: string;
  reason: string;
}

export interface CancelDirective {
  platform_name: string;
  current_tier: string;
  monthly_cost: number;
  reason: string;
  alternative_coverage: string;
  potential_savings: number;
}

export interface UpgradeDirective {
  platform_name: string;
  target_tier: string;
  cost_increase: number;
  roi_reason: string;
  key_benefit: string;
}

export interface ComparisonMetric {
  metric_name: string;
  current_plan: string;
  optimized_plan: string;
  difference: string;
  is_improvement: boolean;
}

export interface ComparisonView {
  current_monthly_cost: number;
  optimized_monthly_cost: number;
  net_monthly_savings: number;
  current_tool_count: number;
  optimized_tool_count: number;
  task_coverage_pct: number;
  redundancy_eliminated_cost: number;
  metrics: ComparisonMetric[];
}

export interface SavingsChartData {
  before_cost: number;
  after_cost: number;
  saved_cost: number;
  breakdown_by_platform: {
    name: string;
    cost: number;
    tier: string;
    type: string;
  }[];
  budget_utilization_pct: number;
  budget_remaining: number;
}

export interface BudgetPlanResponse {
  monthly_budget: number;
  expected_monthly_cost: number;
  expected_savings: number;
  budget_utilization_pct: number;
  budget_status: string;
  best_subscription_combination: SubscriptionRecommendation[];
  platforms_to_cancel: CancelDirective[];
  platforms_to_upgrade: UpgradeDirective[];
  comparison_view: ComparisonView;
  visual_savings_breakdown: SavingsChartData;
  summary_message: string;
}

export async function optimizeBudgetPlan(input: BudgetPlannerInput): Promise<BudgetPlanResponse> {
  const { data } = await apiClient.post<BudgetPlanResponse>("/budget-planner/optimize", input);
  return data;
}

export async function getDefaultBudgetPlan(): Promise<BudgetPlanResponse> {
  const { data } = await apiClient.get<BudgetPlanResponse>("/budget-planner/defaults");
  return data;
}
