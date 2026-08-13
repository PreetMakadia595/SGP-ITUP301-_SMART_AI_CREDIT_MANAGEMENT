"""
Credit Logs Router — /api/v1/credits/logs

CRUD + Filter + Charts API endpoints for manual credit tracking logs.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.credit_log import (
    CreditUsageLogCreate,
    CreditUsageLogUpdate,
    CreditUsageLogRead,
    CreditUsageLogListResponse,
    CreditChartsResponse,
)
from app.services.credit_log_service import CreditLogService

router = APIRouter()


@router.post("/", response_model=CreditUsageLogRead, status_code=status.HTTP_201_CREATED)
def create_credit_log(
    data: CreditUsageLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new manual credit usage log entry."""
    return CreditLogService(db).create(current_user.id, data)


@router.get("/", response_model=CreditUsageLogListResponse)
def list_credit_logs(
    search: Optional[str] = Query(None, description="Search by project name, model, platform or notes"),
    platform: Optional[str] = Query(None, description="Filter by platform name"),
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    start_date: Optional[str] = Query(None, description="Filter from usage date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter to usage date (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List user's credit usage log entries with filter options and pagination."""
    logs, total = CreditLogService(db).list_by_user(
        user_id=current_user.id,
        search=search,
        platform=platform,
        task_type=task_type,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
    return CreditUsageLogListResponse(
        items=logs,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/charts", response_model=CreditChartsResponse)
def get_credit_charts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get aggregated usage data for daily, weekly, and monthly charts."""
    return CreditLogService(db).get_charts_data(current_user.id)


@router.get("/{log_id}", response_model=CreditUsageLogRead)
def get_credit_log(
    log_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a single credit log entry by ID."""
    return CreditLogService(db).get_by_id(log_id, current_user.id)


@router.put("/{log_id}", response_model=CreditUsageLogRead)
def update_credit_log(
    log_id: int,
    data: CreditUsageLogUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update an existing credit usage log entry."""
    return CreditLogService(db).update(log_id, current_user.id, data)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit_log(
    log_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a credit usage log entry."""
    CreditLogService(db).delete(log_id, current_user.id)
    return None
