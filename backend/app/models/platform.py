"""
User Platform ORM Model

Represents a user's managed AI platform credentials, subscription, and credit details.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Float, ForeignKey, Integer, String, DateTime, Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserPlatform(Base):
    __tablename__ = "user_platforms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    platform_name: Mapped[str] = mapped_column(String(50), nullable=False)
    subscription_plan: Mapped[str] = mapped_column(String(50), nullable=False, default="Pro")
    monthly_credits: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    remaining_credits: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    renewal_date: Mapped[str] = mapped_column(String(50), nullable=False)
    monthly_cost: Mapped[float] = mapped_column(Float, nullable=False, default=20.0)
    encrypted_api_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, warning, expired, paused, disconnected
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Sync & Capabilities ──────────────────────────────────────────────────
    auto_sync_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_sync_status: Mapped[str] = mapped_column(String(50), default="never", nullable=False)  # success, failed, never
    supported_features: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON capabilities list

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", backref="platforms")  # noqa: F821

    def __repr__(self) -> str:
        return f"<UserPlatform id={self.id} platform={self.platform_name} status={self.status}>"
