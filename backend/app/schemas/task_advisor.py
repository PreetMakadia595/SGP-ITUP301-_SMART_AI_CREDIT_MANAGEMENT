"""
Pydantic Schemas for Smart Task Advisor
"""
from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# ── Request Bodies ────────────────────────────────────────────────────────────

class TaskAdvisorInput(BaseModel):
    """Body for POST /task-advisor — user's natural-language task."""
    task_input: str = Field(..., min_length=2, max_length=1000, description="Natural-language task description")
    engine: Optional[str] = Field("auto", description="AI Model Persona / Engine: auto, deepseek, gpt4o, gemini, claude")
    constraints: Optional[list[str]] = Field(default_factory=list, description="Optional constraints: free_only, max_speed, deep_reasoning, code_focused")


class TaskAdvisorExecuteInput(BaseModel):
    """Body for POST /task-advisor/execute — run task live."""
    task_input: str = Field(..., min_length=2, max_length=1000, description="Natural-language task description")
    engine: Optional[str] = Field("auto", description="AI Model Persona / Engine")
    system_prompt: Optional[str] = Field(None, description="Optional custom system prompt")


class TaskAdvisorExecuteResponse(BaseModel):
    """Response returned by POST /task-advisor/execute."""
    task_input: str
    engine: str
    optimized_prompt: str
    direct_response: str


class TaskAdvisorFeedbackInput(BaseModel):
    """Body for PATCH /task-advisor/{id}/feedback."""
    feedback: Literal["helpful", "not_helpful"] = Field(..., description="User feedback on the recommendation")


# ── Response Bodies ───────────────────────────────────────────────────────────

class TaskAdvisorResponse(BaseModel):
    """Full recommendation response returned by POST /task-advisor."""
    id: int
    task_input: str
    engine: Optional[str] = "auto"
    best_platform: str
    alternative_platform: str
    reason: str
    estimated_time: str
    estimated_cost: str
    difficulty_level: str
    confidence: float
    reasoning_steps: Optional[list[str]] = None
    optimized_prompt: Optional[str] = None
    model_arena_scores: Optional[dict] = None
    starter_artifact: Optional[dict] = None
    external_url: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TaskAdvisorHistoryItem(BaseModel):
    """Single item in the GET /task-advisor/history list."""
    id: int
    task_input: str
    engine: Optional[str] = "auto"
    best_platform: str
    alternative_platform: str
    reason: str
    estimated_time: str
    estimated_cost: str
    difficulty_level: str
    confidence: float
    reasoning_steps: Optional[list[str]] = None
    optimized_prompt: Optional[str] = None
    model_arena_scores: Optional[dict] = None
    starter_artifact: Optional[dict] = None
    external_url: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
