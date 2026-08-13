"""
Credit Entry ORM Model

Tracks credit consumption per AI service per user.
"""
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CreditEntry(Base):
    __tablename__ = "credit_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_slug: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # e.g. "chatgpt", "claude"
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # ── Credit Values ────────────────────────────────────────────────────────
    credits_used: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    credits_remaining: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    credits_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    cost_usd: Mapped[float] = mapped_column(Float, default=0.0, nullable=True)

    # ── Metadata ─────────────────────────────────────────────────────────────
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="credit_entries")  # noqa: F821

    def __repr__(self) -> str:
        return (
            f"<CreditEntry user={self.user_id} service={self.service_slug} "
            f"used={self.credits_used} remaining={self.credits_remaining}>"
        )
