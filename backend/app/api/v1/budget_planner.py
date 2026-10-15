"""
Budget Planner Router — /api/v1/budget-planner
Provides subscription mix optimization, cancel/upgrade directives, and savings comparisons.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.budget_planner import BudgetPlannerInput, BudgetPlanResponse
from app.services.budget_planner_service import AIBudgetPlannerService

router = APIRouter()


@router.post("/optimize", response_model=BudgetPlanResponse, status_code=status.HTTP_200_OK)
def optimize_budget_plan(
    input_data: BudgetPlannerInput,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Accepts user budget constraints, preferred platforms, usage frequency, and primary tasks.
    Returns optimal subscription combination, expected costs & savings, cancel/upgrade lists, and comparison data.
    """
    service = AIBudgetPlannerService(db)
    return service.generate_plan(current_user.id, input_data)


@router.get("/defaults", response_model=BudgetPlanResponse)
def get_default_budget_plan(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns default optimized budget plan for standard developer/researcher profile.
    """
    default_input = BudgetPlannerInput(
        monthly_budget=3000.0,
        preferred_platforms=["claude", "perplexity", "gemini"],
        usage_frequency="daily_moderate",
        primary_tasks=["coding", "research", "content_writing"],
    )
    service = AIBudgetPlannerService(db)
    return service.generate_plan(current_user.id, default_input)
