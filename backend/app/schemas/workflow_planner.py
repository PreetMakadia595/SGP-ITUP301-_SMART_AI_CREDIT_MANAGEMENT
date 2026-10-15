"""
Pydantic Schemas for AI Workflow Planner Module
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class WorkflowStep(BaseModel):
    step_number: int
    step_title: str
    step_category: str = Field(..., description="research, writing, design, coding, presentation, review, marketing, data")
    best_ai: str
    best_ai_icon: str = "⚡"
    reason: str
    estimated_time: str
    estimated_cost: str
    alternative_ai: str
    alternative_reason: str
    recommended_prompt_template: str
    output_deliverable: str


class WorkflowPlanResponse(BaseModel):
    goal: str
    category: str
    summary: str
    total_estimated_time: str
    total_estimated_cost: str
    total_steps_count: int
    steps: List[WorkflowStep]
    workflow_tips: List[str]


class WorkflowRequest(BaseModel):
    goal: str = Field(..., min_length=2, description="Target goal e.g. 'Prepare PPT', 'Build a Website'")
    custom_context: Optional[str] = Field(default=None, description="Optional extra requirements or constraints")


class WorkflowPreset(BaseModel):
    id: str
    title: str
    icon: str
    description: str
    category: str
    default_prompt: str
