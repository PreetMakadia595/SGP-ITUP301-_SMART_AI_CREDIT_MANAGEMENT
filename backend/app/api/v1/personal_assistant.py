"""
AI Personal Assistant Router — /api/v1/personal-assistant
Provides conversational guidance, question answering, and quick suggestions.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.personal_assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    QuickSuggestion,
    AssistantProfileInsights,
)
from app.services.personal_assistant_service import PersonalAssistantService

router = APIRouter()


@router.post("/chat", response_model=AssistantChatResponse, status_code=status.HTTP_200_OK)
def chat_with_assistant(
    request: AssistantChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Conversational endpoint for personal AI advice. Answers in simple language using user history.
    """
    service = PersonalAssistantService(db)
    return service.answer_user_query(user_id=current_user.id, request=request)


@router.get("/suggestions", response_model=List[QuickSuggestion])
def get_quick_suggestions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns quick starter questions (e.g. Which AI to use, How to save money, Which sub to cancel).
    """
    service = PersonalAssistantService(db)
    return service.get_quick_suggestions()


@router.get("/insights", response_model=AssistantProfileInsights)
def get_assistant_profile_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns high-level snapshot of user's personal advisor context (budget, most used AI, savings opportunity).
    """
    service = PersonalAssistantService(db)
    return service.get_profile_insights(user_id=current_user.id)
