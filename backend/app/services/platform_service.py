"""
Platform Service — Business Logic for AI Platform CRUD & Security Encryption
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.platform import UserPlatform
from app.schemas.platform import PlatformCreate, PlatformUpdate, PlatformRead, PlatformRevealKey
from app.core.security import encrypt_api_key, decrypt_api_key, mask_api_key


def _format_platform_read(platform: UserPlatform) -> PlatformRead:
    """Format ORM model to PlatformRead schema including decrypted-then-masked API key."""
    decrypted_key = decrypt_api_key(platform.encrypted_api_key) if platform.encrypted_api_key else None
    masked_key = mask_api_key(decrypted_key) if decrypted_key else None

    return PlatformRead(
        id=platform.id,
        user_id=platform.user_id,
        platform_name=platform.platform_name,
        subscription_plan=platform.subscription_plan,
        monthly_credits=platform.monthly_credits,
        remaining_credits=platform.remaining_credits,
        renewal_date=platform.renewal_date,
        monthly_cost=platform.monthly_cost,
        masked_api_key=masked_key,
        status=platform.status,
        notes=platform.notes,
        created_at=platform.created_at,
        updated_at=platform.updated_at,
    )


def get_user_platforms(
    db: Session,
    user_id: int,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> List[PlatformRead]:
    """Retrieve all platforms owned by user with optional search & status filtering."""
    query = db.query(UserPlatform).filter(UserPlatform.user_id == user_id)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(UserPlatform.status.ilike(f"{status_filter.strip()}"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (UserPlatform.platform_name.ilike(term)) |
            (UserPlatform.subscription_plan.ilike(term)) |
            (UserPlatform.notes.ilike(term))
        )

    platforms = query.order_by(UserPlatform.created_at.desc()).all()
    return [_format_platform_read(p) for p in platforms]


def get_platform_by_id(db: Session, platform_id: int, user_id: int) -> UserPlatform:
    """Get single user platform or raise 404."""
    platform = (
        db.query(UserPlatform)
        .filter(UserPlatform.id == platform_id, UserPlatform.user_id == user_id)
        .first()
    )
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform not found",
        )
    return platform


def get_platform_read_by_id(db: Session, platform_id: int, user_id: int) -> PlatformRead:
    """Get platform schema for response."""
    platform = get_platform_by_id(db, platform_id, user_id)
    return _format_platform_read(platform)


def create_platform(db: Session, user_id: int, data: PlatformCreate) -> PlatformRead:
    """Add a new AI platform credentials & subscription for user."""
    # Check duplicate platform for same user
    existing = (
        db.query(UserPlatform)
        .filter(
            UserPlatform.user_id == user_id,
            UserPlatform.platform_name == data.platform_name,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Platform '{data.platform_name}' is already added to your workspace. Please edit the existing entry.",
        )

    # Encrypt raw API key if provided
    encrypted_key = encrypt_api_key(data.api_key) if data.api_key else None

    db_platform = UserPlatform(
        user_id=user_id,
        platform_name=data.platform_name,
        subscription_plan=data.subscription_plan,
        monthly_credits=data.monthly_credits,
        remaining_credits=data.remaining_credits,
        renewal_date=data.renewal_date,
        monthly_cost=data.monthly_cost,
        encrypted_api_key=encrypted_key,
        status=data.status or "Active",
        notes=data.notes,
    )

    db.add(db_platform)
    db.commit()
    db.refresh(db_platform)

    return _format_platform_read(db_platform)


def update_platform(
    db: Session, platform_id: int, user_id: int, data: PlatformUpdate
) -> PlatformRead:
    """Update existing platform details for user."""
    platform = get_platform_by_id(db, platform_id, user_id)

    # If updating platform name, verify uniqueness
    if data.platform_name and data.platform_name != platform.platform_name:
        existing = (
            db.query(UserPlatform)
            .filter(
                UserPlatform.user_id == user_id,
                UserPlatform.platform_name == data.platform_name,
                UserPlatform.id != platform_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Platform '{data.platform_name}' already exists in your workspace.",
            )
        platform.platform_name = data.platform_name

    if data.subscription_plan is not None:
        platform.subscription_plan = data.subscription_plan
    if data.monthly_credits is not None:
        platform.monthly_credits = data.monthly_credits
    if data.remaining_credits is not None:
        platform.remaining_credits = data.remaining_credits
    if data.renewal_date is not None:
        platform.renewal_date = data.renewal_date
    if data.monthly_cost is not None:
        platform.monthly_cost = data.monthly_cost
    if data.status is not None:
        platform.status = data.status
    if data.notes is not None:
        platform.notes = data.notes

    # Re-encrypt API key if provided (empty string clears the key)
    if data.api_key is not None:
        if data.api_key.strip() == "":
            platform.encrypted_api_key = None
        else:
            platform.encrypted_api_key = encrypt_api_key(data.api_key.strip())

    db.commit()
    db.refresh(platform)

    return _format_platform_read(platform)


def delete_platform(db: Session, platform_id: int, user_id: int) -> dict:
    """Remove a platform from user workspace."""
    platform = get_platform_by_id(db, platform_id, user_id)
    db.delete(platform)
    db.commit()
    return {"message": f"Platform '{platform.platform_name}' deleted successfully", "id": platform_id}


def reveal_api_key(db: Session, platform_id: int, user_id: int) -> PlatformRevealKey:
    """Decrypt and return raw API key for user reveal modal."""
    platform = get_platform_by_id(db, platform_id, user_id)
    raw_key = decrypt_api_key(platform.encrypted_api_key) if platform.encrypted_api_key else None

    return PlatformRevealKey(
        id=platform.id,
        platform_name=platform.platform_name,
        api_key=raw_key,
    )
