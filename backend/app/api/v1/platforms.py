"""
Platforms Router — API v1 endpoints for AI Platform Management
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.platform import (
    SupportedPlatformRead,
    PlatformRead,
    PlatformCreate,
    PlatformUpdate,
    PlatformRevealKey,
    SUPPORTED_PLATFORMS,
)
from app.services import platform_service

router = APIRouter()


@router.get(
    "/supported",
    response_model=List[SupportedPlatformRead],
    summary="Get supported AI platform catalog",
)
def get_supported_platforms():
    """Return catalog of supported AI platforms (ChatGPT, Claude, Gemini, Cursor, GitHub Copilot, Perplexity, Lovable, Bolt)."""
    return SUPPORTED_PLATFORMS


from typing import List, Optional

@router.get(
    "",
    response_model=List[PlatformRead],
    summary="Get user AI platforms",
)
def list_user_platforms(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all AI platforms added by the current user with optional search & status filter."""
    return platform_service.get_user_platforms(db, current_user.id, search=search, status_filter=status_filter)


@router.post(
    "",
    response_model=PlatformRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add an AI platform",
)
def create_user_platform(
    data: PlatformCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new AI platform with subscription details and encrypted API key."""
    return platform_service.create_platform(db, current_user.id, data)


@router.get(
    "/{platform_id}",
    response_model=PlatformRead,
    summary="Get platform by ID",
)
def get_user_platform(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch details of a single managed AI platform."""
    return platform_service.get_platform_read_by_id(db, platform_id, current_user.id)


@router.put(
    "/{platform_id}",
    response_model=PlatformRead,
    summary="Update platform details",
)
def update_user_platform(
    platform_id: int,
    data: PlatformUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update subscription, credit usage, status, or API key for a managed platform."""
    return platform_service.update_platform(db, platform_id, current_user.id, data)


@router.delete(
    "/{platform_id}",
    summary="Delete platform",
)
def delete_user_platform(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a managed AI platform from user workspace."""
    return platform_service.delete_platform(db, platform_id, current_user.id)


@router.get(
    "/{platform_id}/reveal-key",
    response_model=PlatformRevealKey,
    summary="Reveal decrypted API key",
)
def reveal_platform_api_key(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Decrypt and return the stored raw API key for administrative viewing."""
    return platform_service.reveal_api_key(db, platform_id, current_user.id)
