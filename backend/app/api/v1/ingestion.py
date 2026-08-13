"""
Data Ingestion API Router — /api/v1/ingestion

Ingests usage telemetry from Chrome Browser Extension and Manual Entries.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.data_sync import IngestedUsageEvent
from app.services.sync_service import DataSyncService
from app.schemas.ingestion_schemas import (
    ExtensionEventRequest,
    ManualIngestionRequest,
    DataSourceBreakdownResponse,
)

router = APIRouter()


@router.post("/extension-event", response_model=Dict[str, Any])
def ingest_extension_event(
    body: ExtensionEventRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    JWT-authenticated ingestion endpoint for Chrome Browser Extension.
    Do NOT collect prompt contents by default (Privacy Enforcement).
    """
    sync_service = DataSyncService(db)
    result = sync_service.ingest_extension_event(
        user_id=current_user.id,
        platform=body.platform,
        model=body.model,
        duration_seconds=body.duration_seconds,
        prompt_count=body.prompt_count,
        website_url=body.website_url,
        timestamp=body.timestamp,
    )
    return result


@router.post("/manual", response_model=Dict[str, Any])
def ingest_manual_entry(
    body: ManualIngestionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Ingest manual credit entry through the unified Data Synchronization Layer.
    """
    sync_service = DataSyncService(db)
    result = sync_service.ingest_manual_entry(
        user_id=current_user.id,
        platform=body.platform,
        model=body.model,
        credits_used=body.credits_used,
        prompt_count=body.prompt_count,
        usage_date=body.usage_date,
        notes=body.notes,
    )
    return result


@router.get("/source-breakdown", response_model=DataSourceBreakdownResponse)
def get_data_source_breakdown(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns data breakdown by source (Official API vs Extension vs Manual)."""
    sync_service = DataSyncService(db)
    return sync_service.get_source_breakdown(current_user.id)


@router.get("/latest-events")
def get_latest_events(
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Real-time usage stream of latest ingested events."""
    events = (
        db.query(IngestedUsageEvent)
        .filter(IngestedUsageEvent.user_id == current_user.id)
        .order_by(desc(IngestedUsageEvent.created_at))
        .limit(limit)
        .all()
    )

    return [
        {
            "id": e.id,
            "source_type": e.source_type,
            "platform": e.platform,
            "model": e.model,
            "duration_seconds": e.duration_seconds,
            "prompt_count": e.prompt_count,
            "credits_used": e.credits_used,
            "cost_usd": e.cost_usd,
            "usage_date": e.usage_date,
            "website_url": e.website_url,
            "created_at": e.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for e in events
    ]
