"""
Credit Usage Log Pydantic Schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CreditUsageLogBase(BaseModel):
    platform: str = Field(..., description="Platform name e.g. OpenAI, Anthropic, Google Gemini, Cursor")
    model: str = Field(default="Default Model", description="Model name e.g. gpt-4o, claude-3-5-sonnet")
    project_name: str = Field(default="General Project", description="Project or repository name")
    task_type: str = Field(default="General", description="Task type e.g. Code Generation, Debugging, Writing, Data Analysis")
    credits_used: float = Field(..., ge=0, description="Credits consumed")
    prompt_count: int = Field(default=1, ge=0, description="Number of prompts sent")
    token_usage: int = Field(default=0, ge=0, description="Total tokens consumed")
    usage_date: str = Field(..., description="Usage date in YYYY-MM-DD format")
    notes: Optional[str] = Field(default=None, description="Optional notes or details")


class CreditUsageLogCreate(CreditUsageLogBase):
    pass


class CreditUsageLogUpdate(BaseModel):
    platform: Optional[str] = None
    model: Optional[str] = None
    project_name: Optional[str] = None
    task_type: Optional[str] = None
    credits_used: Optional[float] = Field(default=None, ge=0)
    prompt_count: Optional[int] = Field(default=None, ge=0)
    token_usage: Optional[int] = Field(default=None, ge=0)
    usage_date: Optional[str] = None
    notes: Optional[str] = None


class CreditUsageLogRead(CreditUsageLogBase):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class CreditUsageLogListResponse(BaseModel):
    items: List[CreditUsageLogRead]
    total: int
    skip: int
    limit: int


class ChartDataPoint(BaseModel):
    label: str
    credits_used: float
    prompt_count: int
    token_usage: int


class DistributionPoint(BaseModel):
    name: str
    credits_used: float
    percentage: float


class CreditChartsResponse(BaseModel):
    daily: List[ChartDataPoint]
    weekly: List[ChartDataPoint]
    monthly: List[ChartDataPoint]
    platform_breakdown: List[DistributionPoint]
    task_breakdown: List[DistributionPoint]
    total_credits: float
    total_prompts: int
    total_tokens: int
    total_logs: int
