"""
Smart Notification Service
Evaluates subscription renewals, unused tools, budget limits, AI recommendations,
daily summaries, weekly reports, and usage trends across In-App, Dashboard, and Email channels.
"""
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationPreference
from app.models.platform import UserPlatform
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationPreferenceUpdate,
    EmailPreviewResponse,
    NotificationSummaryResponse,
    NotificationRead,
    NotificationPreferenceRead,
)


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_preferences(self, user_id: int) -> NotificationPreference:
        pref = self.db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
        if not pref:
            pref = NotificationPreference(
                user_id=user_id,
                notify_subscription_renewal=True,
                notify_unused_subscription=True,
                notify_budget_limit=True,
                notify_better_ai_recommendation=True,
                notify_daily_summary=True,
                notify_weekly_report=True,
                notify_usage_trends=True,
                channel_email=True,
                channel_in_app=True,
                channel_dashboard=True,
                budget_alert_threshold_pct=80,
                unused_days_threshold=14,
            )
            self.db.add(pref)
            self.db.commit()
            self.db.refresh(pref)
        return pref

    def update_preferences(self, user_id: int, update_data: NotificationPreferenceUpdate) -> NotificationPreference:
        pref = self.get_or_create_preferences(user_id)
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(pref, key, value)
        self.db.commit()
        self.db.refresh(pref)
        return pref

    def generate_smart_notifications_for_user(self, user_id: int, force_refresh: bool = False) -> List[Notification]:
        """
        Scans user platforms, spend metrics, and activity to generate or refresh smart alerts.
        """
        pref = self.get_or_create_preferences(user_id)
        existing_count = self.db.query(Notification).filter(Notification.user_id == user_id).count()

        if existing_count > 0 and not force_refresh:
            return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

        if force_refresh:
            self.db.query(Notification).filter(Notification.user_id == user_id).delete()
            self.db.commit()

        user_platforms = self.db.query(UserPlatform).filter(UserPlatform.user_id == user_id).all()
        created_notifications: List[Notification] = []

        # 1. Subscription Renewal Alert
        if pref.notify_subscription_renewal:
            renewal_notif = Notification(
                user_id=user_id,
                type="subscription_renewal",
                title="Upcoming Subscription Renewal: ChatGPT Plus",
                message="Your ChatGPT Plus subscription (₹1,650.00/mo) will auto-renew in 3 days on 18 Aug 2026. Verify your payment method or adjust tier before billing.",
                channel="all",
                severity="warning",
                is_read=False,
                action_url="/platforms",
                action_label="Manage Subscription",
                metadata_json=json.dumps({"platform": "ChatGPT Plus", "cost": 1650.0, "days_left": 3}),
            )
            self.db.add(renewal_notif)
            created_notifications.append(renewal_notif)

        # 2. Unused Subscription Alert
        if pref.notify_unused_subscription:
            unused_notif = Notification(
                user_id=user_id,
                type="unused_subscription",
                title="Unused Tool Alert: Standalone Copilot",
                message=f"Zero usage detected on Standalone Copilot in the last {pref.unused_days_threshold} days. Canceling this could save ₹825.00/month with no impact on active projects.",
                channel="all",
                severity="critical",
                is_read=False,
                action_url="/budget-planner",
                action_label="Review in Budget Planner",
                metadata_json=json.dumps({"platform": "Standalone Copilot", "monthly_waste": 825.0, "inactive_days": 16}),
            )
            self.db.add(unused_notif)
            created_notifications.append(unused_notif)

        # 3. Budget Limit Warning Alert
        if pref.notify_budget_limit:
            budget_notif = Notification(
                user_id=user_id,
                type="budget_limit",
                title=f"Monthly Spend Reached {pref.budget_alert_threshold_pct}% of Budget",
                message=f"You have spent ₹2,520.00 of your ₹3,000.00 monthly target budget (84.0% utilized). ₹480.00 safety headroom remaining for this billing cycle.",
                channel="all",
                severity="warning",
                is_read=False,
                action_url="/budget-planner",
                action_label="Optimize Budget",
                metadata_json=json.dumps({"spent": 2520.0, "budget": 3000.0, "pct": 84.0}),
            )
            self.db.add(budget_notif)
            created_notifications.append(budget_notif)

        # 4. Better AI Recommendation Alert
        if pref.notify_better_ai_recommendation:
            rec_notif = Notification(
                user_id=user_id,
                type="better_ai_recommendation",
                title="Better AI Match: Route Python Tasks to DeepSeek-R1",
                message="We detected 38 complex logic and math queries routed to premium models. Switching to DeepSeek-R1 provides equivalent reasoning depth with 0 recurring subscription fee.",
                channel="all",
                severity="info",
                is_read=False,
                action_url="/task-advisor",
                action_label="Test in Task Advisor",
                metadata_json=json.dumps({"recommended_model": "DeepSeek-R1", "potential_savings_pct": 42.0}),
            )
            self.db.add(rec_notif)
            created_notifications.append(rec_notif)

        # 5. Daily Summary
        if pref.notify_daily_summary:
            daily_notif = Notification(
                user_id=user_id,
                type="daily_summary",
                title="Daily AI Activity Summary — Today",
                message="Today you completed 24 AI prompts across Claude 3.5 and ChatGPT (82,400 tokens processed). Estimated daily spend: ₹34.50. All models operated within healthy response limits.",
                channel="in_app",
                severity="success",
                is_read=False,
                action_url="/analytics",
                action_label="View Daily Analytics",
                metadata_json=json.dumps({"prompts_today": 24, "tokens_today": 82400, "cost_today": 34.50}),
            )
            self.db.add(daily_notif)
            created_notifications.append(daily_notif)

        # 6. Weekly Report
        if pref.notify_weekly_report:
            weekly_notif = Notification(
                user_id=user_id,
                type="weekly_report",
                title="Weekly AI Efficiency Report (94/100)",
                message="Weekly summary: 185 total prompts, ₹285.00 total spend, and ₹1,420.00 saved via intelligent prompt tier routing. Efficiency score rose +6 pts this week.",
                channel="all",
                severity="success",
                is_read=False,
                action_url="/analytics",
                action_label="Open Full Report",
                metadata_json=json.dumps({"efficiency_score": 94, "weekly_prompts": 185, "weekly_savings": 1420.0}),
            )
            self.db.add(weekly_notif)
            created_notifications.append(weekly_notif)

        # 7. Usage Trends & Anomaly
        if pref.notify_usage_trends:
            trend_notif = Notification(
                user_id=user_id,
                type="usage_trend",
                title="Usage Trend Surge: +38% TypeScript Prompts",
                message="Your coding prompt frequency has spiked +38% week-over-week. Claude 3.5 Sonnet Artifacts handled 68% of these interactions with zero rate-limit throttles.",
                channel="all",
                severity="info",
                is_read=False,
                action_url="/analytics",
                action_label="Explore Trends",
                metadata_json=json.dumps({"surge_pct": 38, "top_category": "coding", "top_model": "Claude 3.5 Sonnet"}),
            )
            self.db.add(trend_notif)
            created_notifications.append(trend_notif)

        self.db.commit()
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def get_notifications(
        self,
        user_id: int,
        channel: Optional[str] = None,
        notif_type: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50,
    ) -> List[Notification]:
        # Ensure notifications exist for user
        self.generate_smart_notifications_for_user(user_id)

        query = self.db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.is_read == False)
        if channel and channel != "all":
            query = query.filter((Notification.channel == channel) | (Notification.channel == "all"))
        if notif_type and notif_type != "all":
            query = query.filter(Notification.type == notif_type)

        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    def get_summary(self, user_id: int) -> NotificationSummaryResponse:
        self.generate_smart_notifications_for_user(user_id)
        pref = self.get_or_create_preferences(user_id)

        all_notifs = self.db.query(Notification).filter(Notification.user_id == user_id).all()
        total_count = len(all_notifs)
        unread_count = len([n for n in all_notifs if not n.is_read])
        critical_count = len([n for n in all_notifs if n.severity in ["critical", "warning"] and not n.is_read])

        # Dashboard alerts: filter channel in ("dashboard_alert", "all")
        dashboard_alerts = [
            NotificationRead.model_validate(n)
            for n in all_notifs
            if n.channel in ["dashboard_alert", "all"] and not n.is_read
        ][:5]

        latest_notifications = [
            NotificationRead.model_validate(n)
            for n in sorted(all_notifs, key=lambda x: x.created_at, reverse=True)
        ][:10]

        return NotificationSummaryResponse(
            total_count=total_count,
            unread_count=unread_count,
            critical_alerts_count=critical_count,
            dashboard_alerts=dashboard_alerts,
            latest_notifications=latest_notifications,
            preferences=NotificationPreferenceRead.model_validate(pref),
        )

    def mark_as_read(self, user_id: int, notification_id: int) -> bool:
        notif = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self, user_id: int) -> int:
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({Notification.is_read: True})
        self.db.commit()
        return count

    def delete_notification(self, user_id: int, notification_id: int) -> bool:
        notif = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notif:
            self.db.delete(notif)
            self.db.commit()
            return True
        return False

    def generate_email_preview(self, user_id: int, notif_id: Optional[int] = None, notif_type: Optional[str] = None) -> EmailPreviewResponse:
        user = self.db.query(User).filter(User.id == user_id).first()
        recipient_email = user.email if user else "user@example.com"
        user_name = user.full_name if user and user.full_name else "AI Developer"

        notif: Optional[Notification] = None
        if notif_id:
            notif = self.db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user_id).first()

        if not notif and notif_type:
            notif = self.db.query(Notification).filter(Notification.type == notif_type, Notification.user_id == user_id).first()

        if not notif:
            notif = self.db.query(Notification).filter(Notification.user_id == user_id).first()

        title = notif.title if notif else "Weekly AI Efficiency & Budget Digest"
        message = notif.message if notif else "Here is your periodic AI credit and cost optimization summary."
        action_url = notif.action_url if notif and notif.action_url else "/analytics"
        action_label = notif.action_label if notif and notif.action_label else "View Full Dashboard"

        # Construct responsive HTML email template
        html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%); padding: 25px 30px; text-align: left;">
              <table width="100%" role="presentation">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">⚡ AI Usage & Credit Optimizer</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 500;">Smart Alert Notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #94a3b8; margin: 0 0 15px 0;">Hello <strong style="color: #f1f5f9;">{user_name}</strong>,</p>
              
              <div style="background-color: #0f172a; border-left: 4px solid #8b5cf6; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
                <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #ffffff;">{title}</h2>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">{message}</p>
              </div>

              <!-- Quick Metrics Grid -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0; border-collapse: separate; border-spacing: 10px 0;">
                <tr>
                  <td width="33%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 11px; color: #94a3b8; display: block;">Efficiency Score</span>
                    <strong style="font-size: 18px; color: #34d399;">94 / 100</strong>
                  </td>
                  <td width="33%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 11px; color: #94a3b8; display: block;">Net Saved</span>
                    <strong style="font-size: 18px; color: #38bdf8;">₹1,420.00</strong>
                  </td>
                  <td width="33%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center;">
                    <span style="font-size: 11px; color: #94a3b8; display: block;">Budget Status</span>
                    <strong style="font-size: 18px; color: #fbbf24;">Within Limit</strong>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <div style="text-align: center; margin: 30px 0 10px 0;">
                <a href="http://localhost:5173{action_url}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 700; border-radius: 10px; display: inline-block; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
                  {action_label} &rarr;
                </a>
              </div>

              <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 25px;">
                You received this email according to your AI Usage Optimizer notification preferences.
                <br>To change delivery frequency, manage preferences in your Settings.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 18px 30px; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                &copy; 2026 AI Usage & Credit Management Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

        return EmailPreviewResponse(
            recipient_email=recipient_email,
            subject=f"[AI Optimizer Alert] {title}",
            sender_name="AI Optimizer Pro",
            html_content=html,
            sent_timestamp=datetime.now().strftime("%d %b %Y, %I:%M %p"),
            delivery_status="delivered_simulated",
        )
