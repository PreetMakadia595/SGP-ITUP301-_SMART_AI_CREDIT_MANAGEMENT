"""
Pydantic Schemas for AI Budget Planner Module
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class BudgetPlannerInput(BaseModel):
    monthly_budget: float = Field(..., ge=0, description="Monthly AI budget in INR (₹)")
    preferred_platforms: List[str] = Field(default=[], description="List of preferred platforms e.g. ['chatgpt', 'claude', 'perplexity']")
    usage_frequency: str = Field(default="daily_moderate", description="daily_heavy, daily_moderate, weekly_light, occasional")
    primary_tasks: List[str] = Field(default=[], description="List of primary tasks e.g. ['coding', 'content_writing', 'research', 'data_analysis', 'creative']")
    current_platform_ids: Optional[List[int]] = Field(default=None, description="Optional list of current user platform IDs")


class SubscriptionRecommendation(BaseModel):
    platform_name: str
    tier_name: str
    monthly_cost: float
    is_free_tier: bool = False
    best_for: str
    key_features: List[str]
    badge: str
    reason: str


class CancelDirective(BaseModel):
    platform_name: str
    current_tier: str
    monthly_cost: float
    reason: str
    alternative_coverage: str
    potential_savings: float


class UpgradeDirective(BaseModel):
    platform_name: str
    target_tier: str
    cost_increase: float
    roi_reason: str
    key_benefit: str


class ComparisonMetric(BaseModel):
    metric_name: str
    current_plan: str
    optimized_plan: str
    difference: str
    is_improvement: bool = True


class ComparisonView(BaseModel):
    current_monthly_cost: float
    optimized_monthly_cost: float
    net_monthly_savings: float
    current_tool_count: int
    optimized_tool_count: int
    task_coverage_pct: int
    redundancy_eliminated_cost: float
    metrics: List[ComparisonMetric]


class SavingsChartData(BaseModel):
    before_cost: float
    after_cost: float
    saved_cost: float
    breakdown_by_platform: List[Dict[str, Any]]
    budget_utilization_pct: float
    budget_remaining: float


class BudgetPlanResponse(BaseModel):
    monthly_budget: float
    expected_monthly_cost: float
    expected_savings: float
    budget_utilization_pct: float
    budget_status: str
    best_subscription_combination: List[SubscriptionRecommendation]
    platforms_to_cancel: List[CancelDirective]
    platforms_to_upgrade: List[UpgradeDirective]
    comparison_view: ComparisonView
    visual_savings_breakdown: SavingsChartData
    summary_message: str
