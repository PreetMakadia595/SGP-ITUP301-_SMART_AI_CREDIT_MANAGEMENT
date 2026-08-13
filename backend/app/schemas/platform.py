"""
AI Platform Pydantic Schemas — Request/Response models for AI Platform Management
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

SUPPORTED_PLATFORMS = [
    {
        "name": "ChatGPT",
        "slug": "chatgpt",
        "color": "#10A37F",
        "default_plan": "Plus",
        "default_cost": 20.0,
        "default_credits": 1000.0,
        "description": "OpenAI flag-ship conversational and reasoning model platform",
    },
    {
        "name": "Claude",
        "slug": "claude",
        "color": "#D4A96A",
        "default_plan": "Pro",
        "default_cost": 20.0,
        "default_credits": 1000.0,
        "description": "Anthropic advanced AI assistant focused on helpfulness and coding",
    },
    {
        "name": "Gemini",
        "slug": "gemini",
        "color": "#4285F4",
        "default_plan": "Advanced",
        "default_cost": 19.99,
        "default_credits": 1000.0,
        "description": "Google multimodal AI ecosystem and developer API platform",
    },
    {
        "name": "Cursor",
        "slug": "cursor",
        "color": "#7C3AED",
        "default_plan": "Pro",
        "default_cost": 20.0,
        "default_credits": 500.0,
        "description": "AI-first code editor designed for pair programming and codebase indexing",
    },
    {
        "name": "GitHub Copilot",
        "slug": "github-copilot",
        "color": "#24292E",
        "default_plan": "Individual",
        "default_cost": 10.0,
        "default_credits": 2000.0,
        "description": "AI developer tool providing real-time line & function completions",
    },
    {
        "name": "Perplexity",
        "slug": "perplexity",
        "color": "#20B2AA",
        "default_plan": "Pro",
        "default_cost": 20.0,
        "default_credits": 600.0,
        "description": "AI-powered answer engine and citation-backed research assistant",
    },
    {
        "name": "Lovable",
        "slug": "lovable",
        "color": "#EC4899",
        "default_plan": "Starter",
        "default_cost": 20.0,
        "default_credits": 100.0,
        "description": "Full-stack Web AI app builder and rapid prototype generator",
    },
    {
        "name": "Bolt",
        "slug": "bolt",
        "color": "#F59E0B",
        "default_plan": "Pro",
        "default_cost": 20.0,
        "default_credits": 10000.0,
        "description": "In-browser AI dev environment for building and running web apps",
    },
]

VALID_PLATFORM_NAMES = [p["name"] for p in SUPPORTED_PLATFORMS]


class SupportedPlatformRead(BaseModel):
    name: str
    slug: str
    color: str
    default_plan: str
    default_cost: float
    default_credits: float
    description: str


class PlatformCreate(BaseModel):
    platform_name: str = Field(..., description="Must be one of the supported 8 AI platforms")
    subscription_plan: str = Field(default="Pro", max_length=50)
    monthly_credits: float = Field(default=100.0, ge=0, description="Monthly credit allowance")
    remaining_credits: float = Field(default=100.0, ge=0, description="Currently remaining credits")
    renewal_date: str = Field(..., description="Renewal date e.g. YYYY-MM-DD")
    monthly_cost: float = Field(default=0.0, ge=0, description="Monthly cost in USD")
    api_key: Optional[str] = Field(default=None, description="Optional raw API key")
    status: Optional[str] = Field(default="Active", description="Active, Inactive, warning, expired")
    notes: Optional[str] = Field(default=None, description="Custom notes")

    @field_validator("platform_name")
    @classmethod
    def validate_platform_name(cls, v: str) -> str:
        if not v or not v.strip():
            return "ChatGPT"
        v_clean = v.strip()
        aliases = {
            "openai": "ChatGPT",
            "anthropic": "Claude",
            "google": "Gemini",
            "google gemini": "Gemini",
            "copilot": "GitHub Copilot",
        }
        if v_clean.lower() in aliases:
            return aliases[v_clean.lower()]
        
        matched = next((name for name in VALID_PLATFORM_NAMES if name.lower() == v_clean.lower()), None)
        return matched if matched else v_clean


class PlatformUpdate(BaseModel):
    platform_name: Optional[str] = None
    subscription_plan: Optional[str] = None
    monthly_credits: Optional[float] = Field(default=None, ge=0)
    remaining_credits: Optional[float] = Field(default=None, ge=0)
    renewal_date: Optional[str] = None
    monthly_cost: Optional[float] = Field(default=None, ge=0)
    api_key: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("platform_name")
    @classmethod
    def validate_platform_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        v_clean = v.strip()
        aliases = {
            "openai": "ChatGPT",
            "anthropic": "Claude",
            "google": "Gemini",
            "google gemini": "Gemini",
            "copilot": "GitHub Copilot",
        }
        if v_clean.lower() in aliases:
            return aliases[v_clean.lower()]
        matched = next((name for name in VALID_PLATFORM_NAMES if name.lower() == v_clean.lower()), None)
        return matched if matched else v_clean


class PlatformRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    platform_name: str
    subscription_plan: str
    monthly_credits: float
    remaining_credits: float
    renewal_date: str
    monthly_cost: float
    masked_api_key: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PlatformRevealKey(BaseModel):
    id: int
    platform_name: str
    api_key: Optional[str]
