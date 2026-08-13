"""
Credit Entry Pydantic Schemas
"""
from datetime import datetime
from pydantic import BaseModel


class CreditEntryCreate(BaseModel):
    service_slug: str
    service_name: str
    credits_used: float
    credits_remaining: float
    credits_total: float
    cost_usd: float | None = None
    notes: str | None = None


class CreditEntryRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    service_slug: str
    service_name: str
    credits_used: float
    credits_remaining: float
    credits_total: float
    cost_usd: float | None
    notes: str | None
    recorded_at: datetime
    created_at: datetime


class CreditEntryUpdate(BaseModel):
    credits_used: float | None = None
    credits_remaining: float | None = None
    credits_total: float | None = None
    cost_usd: float | None = None
    notes: str | None = None
