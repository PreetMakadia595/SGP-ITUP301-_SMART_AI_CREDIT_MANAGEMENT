"""
Smart Notifications Router — /api/v1/notifications
Manages in-app notifications, dashboard alerts, email previews, and user preferences.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.notification import (
    NotificationRead,
    NotificationPreferenceRead,
    NotificationPreferenceUpdate,
    NotificationSummaryResponse,
    SendEmailPreviewRequest,
    EmailPreviewResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("", response_model=List[NotificationRead])
def get_notifications(
    channel: Optional[str] = Query(None, description="Filter by channel: in_app, email, dashboard_alert, all"),
    notif_type: Optional[str] = Query(None, description="Filter by type"),
    unread_only: bool = Query(False, description="Filter unread only"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns list of notifications filtered by channel, type, and read status.
    """
    service = NotificationService(db)
    return service.get_notifications(
        user_id=current_user.id,
        channel=channel,
        notif_type=notif_type,
        unread_only=unread_only,
        limit=limit,
    )


@router.get("/summary", response_model=NotificationSummaryResponse)
def get_notification_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns total unread count, critical alerts count, dashboard alerts, and user preferences.
    """
    service = NotificationService(db)
    return service.get_summary(user_id=current_user.id)


@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Marks a specific notification as read.
    """
    service = NotificationService(db)
    success = service.mark_as_read(user_id=current_user.id, notification_id=notification_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Marks all notifications for current user as read.
    """
    service = NotificationService(db)
    count = service.mark_all_as_read(user_id=current_user.id)
    return {"message": f"Marked {count} notifications as read", "count": count}


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Dismisses/deletes a specific notification.
    """
    service = NotificationService(db)
    success = service.delete_notification(user_id=current_user.id, notification_id=notification_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Notification deleted successfully"}


@router.get("/preferences", response_model=NotificationPreferenceRead)
def get_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Returns user notification preferences (channels, topics, thresholds).
    """
    service = NotificationService(db)
    return service.get_or_create_preferences(user_id=current_user.id)


@router.put("/preferences", response_model=NotificationPreferenceRead)
def update_notification_preferences(
    update_data: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Updates user notification preferences.
    """
    service = NotificationService(db)
    return service.update_preferences(user_id=current_user.id, update_data=update_data)


@router.post("/test-generate", status_code=status.HTTP_200_OK)
def test_generate_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Triggers a fresh smart scan to evaluate and regenerate user alerts.
    """
    service = NotificationService(db)
    notifs = service.generate_smart_notifications_for_user(user_id=current_user.id, force_refresh=True)
    return {"message": "Smart alerts regenerated", "count": len(notifs)}


@router.post("/email-preview", response_model=EmailPreviewResponse)
def get_email_preview(
    req: SendEmailPreviewRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Renders a live HTML preview of the email notification for testing and display.
    """
    service = NotificationService(db)
    return service.generate_email_preview(
        user_id=current_user.id,
        notif_id=req.notification_id,
        notif_type=req.notification_type,
    )
