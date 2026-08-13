"""
Pydantic Schemas for AI Providers & Synchronization
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ConnectProviderRequest(BaseModel):
    provider_slug: str = Field(..., description="Provider identifier e.g. openai, anthropic, gemini, perplexity")
    api_key: str = Field(..., description="API key to connect and store encrypted")
    auto_sync_enabled: bool = Field(default=True, description="Enable background sync")


class DisconnectProviderRequest(BaseModel):
    provider_slug: str


class ProviderStatusResponse(BaseModel):
    provider_slug: str
    provider_name: str
    is_connected: bool
    status: str
    masked_key: Optional[str] = None
    last_sync_at: Optional[str] = None
    last_sync_status: str
    supports_billing_api: bool
    billing_status: str
    available_models: List[str]


class SyncResponse(BaseModel):
    success: bool
    provider_slug: str
    records_ingested: int
    billing_status: str
    message: Optional[str] = None
    models: List[str] = []


class SyncHistoryItem(BaseModel):
    id: int
    provider_slug: str
    source_type: str
    status: str
    records_ingested: int
    details: Optional[str] = None
    sync_time: str
