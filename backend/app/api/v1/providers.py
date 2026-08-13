"""
Official AI Providers API Router — /api/v1/providers
"""
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.platform import UserPlatform
from app.models.data_sync import SyncHistory
from app.core.security import encrypt_api_key, decrypt_api_key, mask_api_key
from app.services.providers.factory import ProviderFactory
from app.services.sync_service import DataSyncService
from app.schemas.provider_schemas import (
    ConnectProviderRequest,
    DisconnectProviderRequest,
    ProviderStatusResponse,
    SyncResponse,
    SyncHistoryItem,
)

router = APIRouter()


@router.get("/status", response_model=List[ProviderStatusResponse])
def get_providers_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get connection, sync, and billing capabilities for all AI providers."""
    supported = ProviderFactory.list_supported_providers()
    user_platforms = (
        db.query(UserPlatform)
        .filter(UserPlatform.user_id == current_user.id)
        .all()
    )
    platform_map = {p.platform_name.lower(): p for p in user_platforms}

    response = []
    for prov in supported:
        slug = prov["slug"]
        plat = platform_map.get(slug)

        is_connected = bool(plat and plat.encrypted_api_key and plat.status == "active")
        raw_key = decrypt_api_key(plat.encrypted_api_key) if plat and plat.encrypted_api_key else None
        masked = mask_api_key(raw_key) if raw_key else None

        last_sync = plat.last_sync_at.strftime("%Y-%m-%d %H:%M:%S") if plat and plat.last_sync_at else "Never"
        last_status = plat.last_sync_status if plat else "never"

        # Billing status display
        billing_status = "Supported" if prov["supports_billing_api"] else "Not Supported"

        # Determine available models
        provider_impl = ProviderFactory.get_provider(slug)
        models = ["gpt-4o", "gpt-4o-mini"] if slug == "openai" else (
            ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"] if slug == "anthropic" else (
                ["gemini-1.5-pro", "gemini-1.5-flash"] if slug == "gemini" else ["sonar-pro", "sonar"]
            )
        )

        response.append(
            ProviderStatusResponse(
                provider_slug=slug,
                provider_name=prov["name"],
                is_connected=is_connected,
                status=plat.status if plat else "disconnected",
                masked_key=masked,
                last_sync_at=last_sync,
                last_sync_status=last_status,
                supports_billing_api=prov["supports_billing_api"],
                billing_status=billing_status,
                available_models=models,
            )
        )

    return response


@router.post("/connect", response_model=Dict[str, Any])
async def connect_provider(
    body: ConnectProviderRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Connect an Official AI Provider by storing encrypted API key and validating credentials."""
    provider_impl = ProviderFactory.get_provider(body.provider_slug)
    if not provider_impl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{body.provider_slug}' is not supported.",
        )

    # Validate key
    valid, msg = await provider_impl.validate_credentials(body.api_key)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Credential validation failed: {msg}",
        )

    encrypted = encrypt_api_key(body.api_key)

    # Upsert UserPlatform
    plat = (
        db.query(UserPlatform)
        .filter(
            UserPlatform.user_id == current_user.id,
            UserPlatform.platform_name.ilike(body.provider_slug),
        )
        .first()
    )

    if not plat:
        plat = UserPlatform(
            user_id=current_user.id,
            platform_name=provider_impl.provider_name,
            subscription_plan="Pro / Connect",
            monthly_credits=100.0,
            remaining_credits=100.0,
            renewal_date="Monthly",
            monthly_cost=20.0,
            encrypted_api_key=encrypted,
            status="active",
            auto_sync_enabled=body.auto_sync_enabled,
        )
        db.add(plat)
    else:
        plat.encrypted_api_key = encrypted
        plat.status = "active"
        plat.auto_sync_enabled = body.auto_sync_enabled

    db.commit()

    # Immediate initial sync
    sync_service = DataSyncService(db)
    sync_res = await sync_service.sync_provider(current_user.id, body.provider_slug)

    return {
        "message": f"Successfully connected {provider_impl.provider_name}",
        "validation_message": msg,
        "sync_result": sync_res,
    }


@router.post("/disconnect", response_model=Dict[str, Any])
def disconnect_provider(
    body: DisconnectProviderRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Disconnect an AI Provider and remove encrypted credentials."""
    plat = (
        db.query(UserPlatform)
        .filter(
            UserPlatform.user_id == current_user.id,
            UserPlatform.platform_name.ilike(body.provider_slug),
        )
        .first()
    )

    if plat:
        plat.encrypted_api_key = None
        plat.status = "disconnected"
        plat.last_sync_status = "never"
        db.commit()

    return {"message": f"Disconnected {body.provider_slug} successfully."}


@router.post("/sync/{provider_slug}", response_model=SyncResponse)
async def sync_single_provider(
    provider_slug: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Sync single connected provider on demand."""
    sync_service = DataSyncService(db)
    res = await sync_service.sync_provider(current_user.id, provider_slug)
    if not res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("message", "Sync failed"),
        )
    return res


@router.post("/sync-all", response_model=List[SyncResponse])
async def sync_all_providers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Manual Sync Button endpoint: Sync all connected providers at once."""
    sync_service = DataSyncService(db)
    results = await sync_service.sync_all_providers(current_user.id)
    return [
        SyncResponse(
            success=r.get("success", False),
            provider_slug=r.get("provider_slug", "unknown"),
            records_ingested=r.get("records_ingested", 0),
            billing_status=r.get("billing_status", "Not Supported"),
            message=r.get("message"),
            models=r.get("models", []),
        )
        for r in results
    ]


@router.get("/history", response_model=List[SyncHistoryItem])
def get_sync_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Fetch audit history log of synchronization events."""
    logs = (
        db.query(SyncHistory)
        .filter(SyncHistory.user_id == current_user.id)
        .order_by(SyncHistory.sync_time.desc())
        .limit(50)
        .all()
    )

    return [
        SyncHistoryItem(
            id=l.id,
            provider_slug=l.provider_slug,
            source_type=l.source_type,
            status=l.status,
            records_ingested=l.records_ingested,
            details=l.details,
            sync_time=l.sync_time.strftime("%Y-%m-%d %H:%M:%S"),
        )
        for l in logs
    ]
