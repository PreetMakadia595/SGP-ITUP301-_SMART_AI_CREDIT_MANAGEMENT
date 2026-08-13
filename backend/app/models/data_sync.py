"""
Data Sync ORM Models

Stores raw usage ingestion events and synchronization execution history logs.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class IngestedUsageEvent(Base):
    """
    Unified Ingestion Event table storing usage events captured via:
    1. Official AI Provider APIs
    2. Browser Extension
    3. Manual Entry
    """
    __tablename__ = "ingested_usage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # official_api, browser_extension, manual_entry
    platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # openai, anthropic, etc.
    model: Mapped[str] = mapped_column(String(100), nullable=False, default="Default Model")
    
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    prompt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    token_usage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    credits_used: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost_usd: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    usage_date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    website_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sync_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    raw_payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON metadata string

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", backref="ingested_events")  # noqa: F821

    def __repr__(self) -> str:
        return f"<IngestedUsageEvent id={self.id} user={self.user_id} source={self.source_type} platform={self.platform}>"


class SyncHistory(Base):
    """
    Audit log of provider and extension data synchronization runs.
    """
    __tablename__ = "sync_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    provider_slug: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default="official_api")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="success")  # success, error, warning
    records_ingested: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    sync_time: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )

    user: Mapped["User"] = relationship("User", backref="sync_history")  # noqa: F821

    def __repr__(self) -> str:
        return f"<SyncHistory id={self.id} provider={self.provider_slug} status={self.status}>"
