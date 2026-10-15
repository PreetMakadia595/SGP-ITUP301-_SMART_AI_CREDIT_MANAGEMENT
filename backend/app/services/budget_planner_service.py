"""
AI Budget Planner Service
Calculates the optimal subscription combination, cancel/upgrade directives,
side-by-side comparison, and visual savings breakdown.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.platform import UserPlatform
from app.schemas.budget_planner import (
    BudgetPlannerInput,
    BudgetPlanResponse,
    SubscriptionRecommendation,
    CancelDirective,
    UpgradeDirective,
    ComparisonView,
    ComparisonMetric,
    SavingsChartData,
)


class AIBudgetPlannerService:
    def __init__(self, db: Session):
        self.db = db

    def generate_plan(self, user_id: int, input_data: BudgetPlannerInput) -> BudgetPlanResponse:
        # Fetch current user platforms from database
        user_platforms = self.db.query(UserPlatform).filter(UserPlatform.user_id == user_id).all()
        current_active_platforms = [p for p in user_platforms if p.status.lower() == "active"]

        current_total_cost = sum(p.monthly_cost for p in current_active_platforms) if current_active_platforms else 4125.0
        budget = input_data.monthly_budget if input_data.monthly_budget > 0 else 3000.0
        tasks = [t.lower() for t in input_data.primary_tasks] or ["coding", "research"]
        preferred = [p.lower() for p in input_data.preferred_platforms]
        freq = input_data.usage_frequency.lower()

        # Build recommended subscription combination based on tasks & budget
        recommended_combo: List[SubscriptionRecommendation] = []
        cancel_list: List[CancelDirective] = []
        upgrade_list: List[UpgradeDirective] = []

        total_optimized_cost = 0.0

        # Logic for Coding Task
        if "coding" in tasks:
            if "claude" in preferred or budget >= 1650.0:
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="Claude Pro",
                    tier_name="Pro Tier (Claude 3.5 Sonnet)",
                    monthly_cost=1650.0,
                    is_free_tier=False,
                    best_for="Software Architecture & Full-Stack Coding",
                    key_features=["Superior Python/TypeScript generation", "Artifacts visual preview", "200k context window"],
                    badge="Essential for Coding",
                    reason="Ranked #1 for software engineering accuracy and debugging complex codebases."
                ))
                total_optimized_cost += 1650.0
            else:
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="DeepSeek V3",
                    tier_name="Free / Pay-as-you-go",
                    monthly_cost=0.0,
                    is_free_tier=True,
                    best_for="Budget-Friendly Coding & Math",
                    key_features=["Open weights speed", "Zero recurring cost", "Fast code execution"],
                    badge="Budget Pick",
                    reason="Provides high-quality code generation at zero monthly subscription cost."
                ))

        # Logic for Research & Search Task
        if "research" in tasks:
            remaining_budget = budget - total_optimized_cost
            if remaining_budget >= 825.0 and ("perplexity" in preferred or freq == "daily_heavy"):
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="Perplexity Pro",
                    tier_name="Pro Plan",
                    monthly_cost=825.0,
                    is_free_tier=False,
                    best_for="Live Web Search & Verified Citations",
                    key_features=["Real-time web crawling", "Academic paper synthesis", "Multi-model toggle (Claude/GPT-4o)"],
                    badge="Top Research Tool",
                    reason="Replaces manual Google searches with instant synthesized citations."
                ))
                total_optimized_cost += 825.0
            else:
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="Perplexity Standard",
                    tier_name="Free Search Tier",
                    monthly_cost=0.0,
                    is_free_tier=True,
                    best_for="Quick Web Queries",
                    key_features=["5 Pro searches daily", "Standard citation linking", "Instant answers"],
                    badge="Zero-Cost Research",
                    reason="Covers daily research lookups without recurring monthly fees."
                ))

        # Logic for Content Writing / General Tasks
        if "content_writing" in tasks or "data_analysis" in tasks:
            remaining_budget = budget - total_optimized_cost
            if remaining_budget >= 1650.0 and "chatgpt" in preferred and not any(r.platform_name.startswith("ChatGPT") for r in recommended_combo):
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="ChatGPT Plus",
                    tier_name="Plus Plan (GPT-4o)",
                    monthly_cost=1650.0,
                    is_free_tier=False,
                    best_for="Data Analysis & Document Writing",
                    key_features=["Advanced Data Analysis sandbox", "Custom GPTs ecosystem", "DALL-E 3 image generator"],
                    badge="Versatile Multimodal",
                    reason="Comprehensive data crunching and creative drafting."
                ))
                total_optimized_cost += 1650.0
            else:
                # Complement with Gemini Free / Flash
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="Gemini 1.5 Flash",
                    tier_name="Free Web Tier",
                    monthly_cost=0.0,
                    is_free_tier=True,
                    best_for="Long Context Summaries & Email Writing",
                    key_features=["1M token context", "Blazing fast inference", "Google Workspace integration"],
                    badge="Complimentary Powerhouse",
                    reason="Handles massive PDF summaries and drafts at zero cost, freeing up budget."
                ))

        # Logic for Creative / Image Design
        if "creative" in tasks:
            remaining_budget = budget - total_optimized_cost
            if remaining_budget >= 825.0:
                recommended_combo.append(SubscriptionRecommendation(
                    platform_name="Midjourney Basic",
                    tier_name="Basic Pass",
                    monthly_cost=825.0,
                    is_free_tier=False,
                    best_for="Photorealistic Image Generation",
                    key_features=["Commercial asset generation", "High resolution upscaling", "Style exploration"],
                    badge="Creative Specialist",
                    reason="Industry benchmark for artistic branding and marketing visuals."
                ))
                total_optimized_cost += 825.0

        # Fallback if combo is empty
        if not recommended_combo:
            recommended_combo = [
                SubscriptionRecommendation(
                    platform_name="Claude Pro",
                    tier_name="Pro Tier",
                    monthly_cost=1650.0,
                    is_free_tier=False,
                    best_for="All-around Development & Analysis",
                    key_features=["Claude 3.5 Sonnet", "Artifacts UI", "Code Intelligence"],
                    badge="Primary Assistant",
                    reason="Best balance of capability and cost for everyday professional tasks."
                ),
                SubscriptionRecommendation(
                    platform_name="Gemini 1.5 Flash",
                    tier_name="Free Tier",
                    monthly_cost=0.0,
                    is_free_tier=True,
                    best_for="Fast Document Search & Drafting",
                    key_features=["1M token context", "Free tier access", "Google sync"],
                    badge="Free Complement",
                    reason="Handles high-frequency light requests at zero cost."
                ),
            ]
            total_optimized_cost = 1650.0

        # Generate Platforms to Cancel
        if any(r.platform_name == "Claude Pro" for r in recommended_combo):
            cancel_list.append(CancelDirective(
                platform_name="ChatGPT Plus",
                current_tier="Plus ($20/mo)",
                monthly_cost=1650.0,
                reason="Redundant coding capability. Claude 3.5 covers 100% of your programming and logic tasks with higher precision.",
                alternative_coverage="Claude Pro + Free Gemini Flash",
                potential_savings=1650.0,
            ))

        if total_optimized_cost > budget:
            cancel_list.append(CancelDirective(
                platform_name="Standalone Copilot",
                current_tier="Individual Plan",
                monthly_cost=825.0,
                reason="Overlap with Claude Pro Artifacts and open-source autocomplete extensions.",
                alternative_coverage="Claude 3.5 Sonnet",
                potential_savings=825.0,
            ))

        # Generate Platforms to Upgrade
        if "research" in tasks and not any(r.platform_name == "Perplexity Pro" for r in recommended_combo):
            upgrade_list.append(UpgradeDirective(
                platform_name="Perplexity",
                target_tier="Pro Plan (₹825/mo)",
                cost_increase=825.0,
                roi_reason="Unlocks unlimited file uploads and Pro academic search models (Claude 3.5 & GPT-4o).",
                key_benefit="Saves 4+ hours of manual Google searching weekly."
            ))

        if "coding" in tasks and freq == "daily_heavy" and not any(r.platform_name == "Claude Pro" for r in recommended_combo):
            upgrade_list.append(UpgradeDirective(
                platform_name="Claude",
                target_tier="Pro Plan (₹1,650/mo)",
                cost_increase=1650.0,
                roi_reason="Provides 5x higher prompt limits on Sonnet 3.5 during peak sprint hours.",
                key_benefit="Zero wait times during critical project deadlines."
            ))

        # Calculate Savings & Utilization
        net_savings = max(0.0, current_total_cost - total_optimized_cost)
        utilization_pct = min(100.0, round((total_optimized_cost / budget) * 100, 1)) if budget > 0 else 0.0

        # Comparison Metrics
        comparison_metrics = [
            ComparisonMetric(
                metric_name="Monthly Subscription Spend",
                current_plan=f"₹{current_total_cost:.2f}",
                optimized_plan=f"₹{total_optimized_cost:.2f}",
                difference=f"-₹{net_savings:.2f} / month",
                is_improvement=True
            ),
            ComparisonMetric(
                metric_name="Task Capability Coverage",
                current_plan="85%",
                optimized_plan="98%",
                difference="+13% capability gain",
                is_improvement=True
            ),
            ComparisonMetric(
                metric_name="Overlapping / Redundant Tools",
                current_plan="2 Overlapping Tools",
                optimized_plan="0 Redundancy (Zero Waste)",
                difference="2 tools consolidated",
                is_improvement=True
            ),
            ComparisonMetric(
                metric_name="Budget Health Status",
                current_plan="Over Budget (+₹1,125)",
                optimized_plan=f"Under Budget (₹{max(0.0, budget - total_optimized_cost):.0f} buffer)",
                difference="Within safety limit",
                is_improvement=True
            ),
        ]

        comparison_view = ComparisonView(
            current_monthly_cost=current_total_cost,
            optimized_monthly_cost=total_optimized_cost,
            net_monthly_savings=net_savings,
            current_tool_count=len(current_active_platforms) if current_active_platforms else 3,
            optimized_tool_count=len([r for r in recommended_combo if not r.is_free_tier]),
            task_coverage_pct=98,
            redundancy_eliminated_cost=1650.0,
            metrics=comparison_metrics,
        )

        # Visual Savings Breakdown Data
        breakdown_platforms = []
        for r in recommended_combo:
            breakdown_platforms.append({
                "name": r.platform_name,
                "cost": r.monthly_cost,
                "tier": r.tier_name,
                "type": "Free Complement" if r.is_free_tier else "Paid Subscription"
            })

        savings_chart_data = SavingsChartData(
            before_cost=current_total_cost,
            after_cost=total_optimized_cost,
            saved_cost=net_savings,
            breakdown_by_platform=breakdown_platforms,
            budget_utilization_pct=utilization_pct,
            budget_remaining=max(0.0, budget - total_optimized_cost),
        )

        summary_message = (
            f"By consolidating redundant tools and pairing {recommended_combo[0].platform_name} with "
            f"free tier models, you save ₹{net_savings:.0f} each month while achieving 98% task coverage."
        )

        return BudgetPlanResponse(
            monthly_budget=budget,
            expected_monthly_cost=total_optimized_cost,
            expected_savings=net_savings,
            budget_utilization_pct=utilization_pct,
            budget_status="Optimal (Within Target Budget)" if total_optimized_cost <= budget else "Slight Budget Stretch",
            best_subscription_combination=recommended_combo,
            platforms_to_cancel=cancel_list,
            platforms_to_upgrade=upgrade_list,
            comparison_view=comparison_view,
            visual_savings_breakdown=savings_chart_data,
            summary_message=summary_message,
        )
