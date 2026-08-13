"""
Pydantic Schemas for Browser Extension Ingestion and Telemetry
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class ExtensionEventRequest(BaseModel):
    platform: str = Field(..., description="Target AI website e.g. chatgpt, claude, gemini, perplexity, cursor, bolt, lovable")
    model: str = Field(..., description="Active model name e.g. gpt-4o, claude-3-5-sonnet")
    duration_seconds: int = Field(default=0, ge=0, description="Active session duration in seconds")
    prompt_count: int = Field(default=1, ge=1, description="Number of prompts sent")
    website_url: str = Field(..., description="Current web page URL")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp of event")


class ManualIngestionRequest(BaseModel):
    platform: str
    model: str
    credits_used: float
    prompt_count: int
    usage_date: str
    notes: Optional[str] = None


class DataSourceBreakdownResponse(BaseModel):
    total_events: int
    sources: List[dict]


# ── Usage Tracker Summary ─────────────────────────────────────────────────────

class PeriodStats(BaseModel):
    credits: float
    prompts: int
    tokens: int
    sessions: int
    cost_usd: float
    duration_seconds: int


class PlatformStat(BaseModel):
    platform: str
    credits: float
    prompts: int
    sessions: int


class TaskStat(BaseModel):
    task_type: str
    count: int


class SourceBreakdown(BaseModel):
    manual_entry: int
    official_api: int
    browser_extension: int


class UsageSummaryResponse(BaseModel):
    today: PeriodStats
    this_week: PeriodStats
    this_month: PeriodStats
    total: PeriodStats
    most_used_ai: Optional[str]
    favorite_ai: Optional[str]
    source_breakdown: SourceBreakdown
    platform_distribution: List[PlatformStat]
    task_distribution: List[TaskStat]
    period: dict
