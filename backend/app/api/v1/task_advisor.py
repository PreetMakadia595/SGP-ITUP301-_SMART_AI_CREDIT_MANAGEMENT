import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.task_advisor import TaskAdvisorRequest
from app.schemas.task_advisor import (
    TaskAdvisorInput,
    TaskAdvisorExecuteInput,
    TaskAdvisorExecuteResponse,
    TaskAdvisorFeedbackInput,
    TaskAdvisorResponse,
    TaskAdvisorHistoryItem,
)
from app.services.task_advisor_service import recommend, execute_task

router = APIRouter()


def _to_response_dict(record: TaskAdvisorRequest) -> dict:
    """Helper to deserialize JSON strings from DB into Pydantic-compatible dict."""
    data = {
        "id": record.id,
        "task_input": record.task_input,
        "engine": record.engine or "auto",
        "best_platform": record.best_platform,
        "alternative_platform": record.alternative_platform,
        "reason": record.reason,
        "estimated_time": record.estimated_time,
        "estimated_cost": record.estimated_cost,
        "difficulty_level": record.difficulty_level,
        "confidence": record.confidence,
        "optimized_prompt": record.optimized_prompt,
        "external_url": record.external_url,
        "feedback": record.feedback,
        "created_at": record.created_at,
        "reasoning_steps": None,
        "model_arena_scores": None,
        "starter_artifact": None,
    }
    if record.reasoning_steps:
        try:
            data["reasoning_steps"] = json.loads(record.reasoning_steps)
        except Exception:
            data["reasoning_steps"] = [record.reasoning_steps]
    if record.model_arena_scores:
        try:
            data["model_arena_scores"] = json.loads(record.model_arena_scores)
        except Exception:
            data["model_arena_scores"] = {}
    if record.starter_artifact:
        try:
            data["starter_artifact"] = json.loads(record.starter_artifact)
        except Exception:
            data["starter_artifact"] = {}
    return data


# ── POST / — Submit a task and receive a recommendation ───────────────────────
@router.post("/", response_model=TaskAdvisorResponse, status_code=status.HTTP_201_CREATED)
def create_task_recommendation(
    body: TaskAdvisorInput,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Accept a natural-language task description, run it through the multi-model
    recommendation engine, persist the result, and return extended recommendation.
    """
    rec = recommend(
        task_input=body.task_input,
        engine=body.engine or "auto",
        constraints=body.constraints,
    )

    record = TaskAdvisorRequest(
        user_id=current_user.id,
        task_input=body.task_input,
        engine=body.engine or "auto",
        best_platform=rec.best_platform,
        alternative_platform=rec.alternative_platform,
        reason=rec.reason,
        estimated_time=rec.estimated_time,
        estimated_cost=rec.estimated_cost,
        difficulty_level=rec.difficulty_level,
        confidence=rec.confidence,
        reasoning_steps=json.dumps(rec.reasoning_steps) if rec.reasoning_steps else None,
        optimized_prompt=rec.optimized_prompt,
        model_arena_scores=json.dumps(rec.model_arena_scores) if rec.model_arena_scores else None,
        starter_artifact=json.dumps(rec.starter_artifact) if rec.starter_artifact else None,
        external_url=rec.external_url,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return _to_response_dict(record)


# ── POST /execute — Run task live using AI engine ────────────────────────────
@router.post("/execute", response_model=TaskAdvisorExecuteResponse)
def run_live_task_execution(
    body: TaskAdvisorExecuteInput,
    current_user: User = Depends(get_current_active_user),
):
    """
    Execute a task live using the selected AI engine persona.
    """
    res = execute_task(
        task_input=body.task_input,
        engine=body.engine or "auto",
        system_prompt=body.system_prompt,
    )
    return res


# ── PATCH /{id}/feedback — Submit user feedback ──────────────────────────────
@router.patch("/{request_id}/feedback", response_model=TaskAdvisorResponse)
def submit_feedback(
    request_id: int,
    body: TaskAdvisorFeedbackInput,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update the feedback field on an existing task advisor request.
    Only the owning user can submit feedback.
    """
    record = (
        db.query(TaskAdvisorRequest)
        .filter(
            TaskAdvisorRequest.id == request_id,
            TaskAdvisorRequest.user_id == current_user.id,
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task advisor request not found",
        )

    record.feedback = body.feedback
    db.commit()
    db.refresh(record)

    return _to_response_dict(record)


# ── GET /history — List past advisor requests ─────────────────────────────────
@router.get("/history", response_model=list[TaskAdvisorHistoryItem])
def get_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Return the current user's past task advisor requests,
    ordered newest-first with pagination.
    """
    rows = (
        db.query(TaskAdvisorRequest)
        .filter(TaskAdvisorRequest.user_id == current_user.id)
        .order_by(TaskAdvisorRequest.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [_to_response_dict(r) for r in rows]

