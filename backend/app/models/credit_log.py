"""
Credit Usage Log ORM Model

Tracks detailed credit consumption records per user, platform, model, project, and task type.
"""
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CreditUsageLog(Base):
    __tablename__ = "credit_usage_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # e.g. ChatGPT, Claude
    model: Mapped[str] = mapped_column(String(100), nullable=False, default="Default Model")
    project_name: Mapped[str] = mapped_column(String(100), nullable=False, default="General Project")
    task_type: Mapped[str] = mapped_column(String(50), nullable=False, default="General")  # Code Gen, Debugging, Chat, etc.

    credits_used: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    prompt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    token_usage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    usage_date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", backref="credit_logs")  # noqa: F821

    def __repr__(self) -> str:
        return (
            f"<CreditUsageLog id={self.id} user={self.user_id} platform={self.platform} "
            f"used={self.credits_used} date={self.usage_date}>"
        )
