"""
Pydantic Schemas for AI Personal Assistant Module
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AssistantActionCard(BaseModel):
    id: str
    title: str
    description: str
    button_label: str
    button_url: str
    action_type: str = "navigate"  # navigate, cancel_sub, optimize
    badge: Optional[str] = None
    highlight_color: Optional[str] = "brand"  # brand, red, emerald, amber, cyan


class AssistantChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str
    timestamp: Optional[str] = None
    action_cards: Optional[List[AssistantActionCard]] = None
    suggested_follow_ups: Optional[List[str]] = None


class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or prompt")
    history: Optional[List[AssistantChatMessage]] = Field(default=[], description="Prior conversation messages")


class AssistantChatResponse(BaseModel):
    reply: str
    personalized_context: Dict[str, Any] = Field(default_factory=dict)
    action_cards: List[AssistantActionCard] = Field(default_factory=list)
    suggested_follow_ups: List[str] = Field(default_factory=list)


class QuickSuggestion(BaseModel):
    id: str
    category: str
    question: str
    description: str
    icon: str


class AssistantProfileInsights(BaseModel):
    user_name: str
    monthly_budget: float
    current_spend: float
    most_used_ai: str
    most_used_percentage: int
    active_subscriptions_count: int
    top_saving_opportunity: str
    potential_monthly_savings: float
