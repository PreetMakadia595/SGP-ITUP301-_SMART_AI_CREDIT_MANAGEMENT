"""
TaskAdvisorRequest ORM Model

Stores every Smart Task Advisor recommendation request with user feedback.
"""
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TaskAdvisorRequest(Base):
    __tablename__ = "task_advisor_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── User Input & Options ──────────────────────────────────────────────────
    task_input: Mapped[str] = mapped_column(Text, nullable=False)
    engine: Mapped[str] = mapped_column(String(50), nullable=True, default="auto")

    # ── Recommendation Fields ─────────────────────────────────────────────────
    best_platform: Mapped[str] = mapped_column(String(100), nullable=False)
    alternative_platform: Mapped[str] = mapped_column(String(100), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_time: Mapped[str] = mapped_column(String(50), nullable=False)       # e.g. "2-5 minutes"
    estimated_cost: Mapped[str] = mapped_column(String(50), nullable=False)       # e.g. "Free" / "₹0.02"
    difficulty_level: Mapped[str] = mapped_column(String(20), nullable=False)     # Easy / Medium / Hard
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)  # 0.0 – 100.0

    # ── Extended AI Agent Fields ──────────────────────────────────────────────
    reasoning_steps: Mapped[str] = mapped_column(Text, nullable=True)     # JSON array string
    optimized_prompt: Mapped[str] = mapped_column(Text, nullable=True)    # Ready-to-copy prompt
    model_arena_scores: Mapped[str] = mapped_column(Text, nullable=True)  # JSON object string
    starter_artifact: Mapped[str] = mapped_column(Text, nullable=True)    # JSON object string (code/draft)
    external_url: Mapped[str] = mapped_column(String(255), nullable=True) # Direct model URL

    # ── User Feedback ─────────────────────────────────────────────────────────
    feedback: Mapped[str] = mapped_column(String(20), nullable=True)  # "helpful" / "not_helpful"

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", backref="task_advisor_requests")  # noqa: F821

    def __repr__(self) -> str:
        return (
            f"<TaskAdvisorRequest id={self.id} user={self.user_id} "
            f'best="{self.best_platform}" feedback={self.feedback}>'
        )
