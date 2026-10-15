"""
Workflow Planner Router — /api/v1/workflow-planner
Decomposes user goals into an actionable multi-step timeline with AI recommendations.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.workflow_planner import (
    WorkflowRequest,
    WorkflowPlanResponse,
    WorkflowPreset,
)
from app.services.workflow_planner_service import AIWorkflowPlannerService

router = APIRouter()
planner_service = AIWorkflowPlannerService()


@router.get("/presets", response_model=List[WorkflowPreset])
def get_workflow_presets(
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns standard goal presets for quick one-click workflow planning.
    """
    return planner_service.get_presets()


@router.post("/generate", response_model=WorkflowPlanResponse, status_code=status.HTTP_200_OK)
def generate_workflow(
    request: WorkflowRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Deconstructs user goal into a sequential step-by-step workflow timeline.
    For each step, provides Best AI, reason, estimated time & cost, alternative AI, and copyable prompt.
    """
    return planner_service.generate_workflow(request)
