/**
 * Smart Notifications API Client
 */
import { apiClient } from "./client";

export interface NotificationItem {
  id: number;
  user_id: number;
  type:
    | "subscription_renewal"
    | "unused_subscription"
    | "budget_limit"
    | "better_ai_recommendation"
    | "daily_summary"
    | "weekly_report"
    | "usage_trend"
    | string;
  title: string;
  message: string;
  channel: "in_app" | "email" | "dashboard_alert" | "all" | string;
  severity: "info" | "warning" | "critical" | "success" | string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata_json?: string;
  created_at: string;
}

export interface NotificationPreference {
  id: number;
  user_id: number;
  notify_subscription_renewal: boolean;
  notify_unused_subscription: boolean;
  notify_budget_limit: boolean;
  notify_better_ai_recommendation: boolean;
  notify_daily_summary: boolean;
  notify_weekly_report: boolean;
  notify_usage_trends: boolean;
  channel_email: boolean;
  channel_in_app: boolean;
  channel_dashboard: boolean;
  budget_alert_threshold_pct: number;
  unused_days_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationSummary {
  total_count: number;
  unread_count: number;
  critical_alerts_count: number;
  dashboard_alerts: NotificationItem[];
  latest_notifications: NotificationItem[];
  preferences: NotificationPreference;
}

export interface EmailPreviewResponse {
  recipient_email: string;
  subject: string;
  sender_name: string;
  html_content: string;
  sent_timestamp: string;
  delivery_status: string;
}

export async function getNotifications(params?: {
  channel?: string;
  notif_type?: string;
  unread_only?: boolean;
  limit?: number;
}): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[]>("/notifications", {
    params,
  });
  return data;
}

export async function getNotificationSummary(): Promise<NotificationSummary> {
  const { data } = await apiClient.get<NotificationSummary>("/notifications/summary");
  return data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/notifications/mark-all-read");
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}

export async function getNotificationPreferences(): Promise<NotificationPreference> {
  const { data } = await apiClient.get<NotificationPreference>("/notifications/preferences");
  return data;
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  const { data } = await apiClient.put<NotificationPreference>("/notifications/preferences", prefs);
  return data;
}

export async function triggerNotificationScan(): Promise<void> {
  await apiClient.post("/notifications/test-generate");
}

export async function getEmailPreview(
  notificationId?: number,
  notificationType?: string
): Promise<EmailPreviewResponse> {
  const { data } = await apiClient.post<EmailPreviewResponse>("/notifications/email-preview", {
    notification_id: notificationId,
    notification_type: notificationType,
  });
  return data;
}
