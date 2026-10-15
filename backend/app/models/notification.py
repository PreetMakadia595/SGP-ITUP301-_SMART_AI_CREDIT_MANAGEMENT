"""
Notification & Notification Preferences ORM Models
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # subscription_renewal, unused_subscription, budget_limit, better_ai_recommendation, daily_summary, weekly_report, usage_trend
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[str] = mapped_column(
        String(50), nullable=False, default="all"
    )  # in_app, email, dashboard_alert, all
    severity: Mapped[str] = mapped_column(
        String(20), nullable=False, default="info"
    )  # info, warning, critical, success
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    action_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    action_label: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", backref="notifications")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Notification id={self.id} type={self.type} title={self.title} is_read={self.is_read}>"


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )

    # Topic Preferences
    notify_subscription_renewal: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_unused_subscription: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_budget_limit: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_better_ai_recommendation: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_daily_summary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_weekly_report: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notify_usage_trends: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Delivery Channel Preferences
    channel_email: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    channel_in_app: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    channel_dashboard: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Thresholds
    budget_alert_threshold_pct: Mapped[int] = mapped_column(Integer, default=80, nullable=False)
    unused_days_threshold: Mapped[int] = mapped_column(Integer, default=14, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", backref="notification_preference")  # noqa: F821
