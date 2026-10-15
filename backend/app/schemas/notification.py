"""
Pydantic Schemas for Smart Notifications Module
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    type: str = Field(..., description="subscription_renewal, unused_subscription, budget_limit, better_ai_recommendation, daily_summary, weekly_report, usage_trend")
    title: str
    message: str
    channel: str = Field(default="all", description="in_app, email, dashboard_alert, all")
    severity: str = Field(default="info", description="info, warning, critical, success")
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    metadata_json: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationRead(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferenceBase(BaseModel):
    notify_subscription_renewal: bool = True
    notify_unused_subscription: bool = True
    notify_budget_limit: bool = True
    notify_better_ai_recommendation: bool = True
    notify_daily_summary: bool = True
    notify_weekly_report: bool = True
    notify_usage_trends: bool = True

    channel_email: bool = True
    channel_in_app: bool = True
    channel_dashboard: bool = True

    budget_alert_threshold_pct: int = 80
    unused_days_threshold: int = 14


class NotificationPreferenceUpdate(BaseModel):
    notify_subscription_renewal: Optional[bool] = None
    notify_unused_subscription: Optional[bool] = None
    notify_budget_limit: Optional[bool] = None
    notify_better_ai_recommendation: Optional[bool] = None
    notify_daily_summary: Optional[bool] = None
    notify_weekly_report: Optional[bool] = None
    notify_usage_trends: Optional[bool] = None

    channel_email: Optional[bool] = None
    channel_in_app: Optional[bool] = None
    channel_dashboard: Optional[bool] = None

    budget_alert_threshold_pct: Optional[int] = None
    unused_days_threshold: Optional[int] = None


class NotificationPreferenceRead(NotificationPreferenceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationSummaryResponse(BaseModel):
    total_count: int
    unread_count: int
    critical_alerts_count: int
    dashboard_alerts: List[NotificationRead]
    latest_notifications: List[NotificationRead]
    preferences: NotificationPreferenceRead


class SendEmailPreviewRequest(BaseModel):
    notification_id: Optional[int] = None
    notification_type: Optional[str] = "weekly_report"


class EmailPreviewResponse(BaseModel):
    recipient_email: str
    subject: str
    sender_name: str = "AI Credit & Usage Optimizer"
    html_content: str
    sent_timestamp: str
    delivery_status: str = "delivered_simulated"
