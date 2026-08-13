"""
Analytics Router — /api/v1/analytics

Scaffolded for Phase 2 ML integration.
Currently returns usage trend data from credit entries.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.credit import CreditEntry

router = APIRouter()


@router.get("/overview")
def analytics_overview(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    High-level analytics overview:
    - Total credits used across all services
    - Total cost
    - Number of services tracked
    - Most used service
    """
    rows = (
        db.query(
            CreditEntry.service_slug,
            CreditEntry.service_name,
            func.sum(CreditEntry.credits_used).label("total_used"),
            func.sum(CreditEntry.cost_usd).label("total_cost"),
            func.count(CreditEntry.id).label("entry_count"),
        )
        .filter(CreditEntry.user_id == current_user.id)
        .group_by(CreditEntry.service_slug, CreditEntry.service_name)
        .all()
    )

    total_used = sum(r.total_used or 0 for r in rows)
    total_cost = sum(r.total_cost or 0 for r in rows)
    most_used = max(rows, key=lambda r: r.total_used or 0, default=None)

    return {
        "total_credits_used": total_used,
        "total_cost_usd": total_cost,
        "services_tracked": len(rows),
        "most_used_service": most_used.service_name if most_used else None,
        "breakdown": [
            {
                "service_slug": r.service_slug,
                "service_name": r.service_name,
                "total_used": float(r.total_used or 0),
                "total_cost": float(r.total_cost or 0),
                "entry_count": r.entry_count,
            }
            for r in rows
        ],
    }


@router.get("/trends")
def usage_trends(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Daily usage trend for the last 30 days.
    (ML prediction endpoint scaffolded — will use XGBoost in Phase 2)
    """
    from sqlalchemy import cast, Date
    rows = (
        db.query(
            cast(CreditEntry.recorded_at, Date).label("date"),
            func.sum(CreditEntry.credits_used).label("credits_used"),
            func.sum(CreditEntry.cost_usd).label("cost_usd"),
        )
        .filter(CreditEntry.user_id == current_user.id)
        .group_by(cast(CreditEntry.recorded_at, Date))
        .order_by(cast(CreditEntry.recorded_at, Date).desc())
        .limit(30)
        .all()
    )
    return [
        {"date": str(r.date), "credits_used": float(r.credits_used or 0), "cost_usd": float(r.cost_usd or 0)}
        for r in rows
    ]


@router.get("/ml")
def get_ml_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    ML Prediction Endpoint.
    Runs regression & forecasting models (Linear Regression, Random Forest, XGBoost)
    to predict Daily Usage, Weekly Usage, Monthly Spending, Budget Forecast, and Credit Exhaustion.
    """
    from app.services.ml_service import MLPredictionEngine
    engine = MLPredictionEngine(db)
    return engine.update_predictions_for_user(current_user.id)


@router.get("/usage-summary")
def get_usage_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    AI Usage Tracker Summary Endpoint.

    Returns aggregated usage statistics for today, this week, and this month
    by combining data from credit_usage_logs and ingested_usage_events tables.
    Also computes Most Used AI (by prompt count) and Favorite AI (by session duration).
    """
    from datetime import datetime, timedelta
    from app.models.credit_log import CreditUsageLog
    from app.models.data_sync import IngestedUsageEvent

    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())      # Monday
    month_start = today.replace(day=1)

    today_str = today.strftime("%Y-%m-%d")
    week_start_str = week_start.strftime("%Y-%m-%d")
    month_start_str = month_start.strftime("%Y-%m-%d")

    # ── Pull from credit_usage_logs ───────────────────────────────────────────
    logs = (
        db.query(CreditUsageLog)
        .filter(CreditUsageLog.user_id == current_user.id)
        .all()
    )

    # ── Pull from ingested_usage_events ───────────────────────────────────────
    events = (
        db.query(IngestedUsageEvent)
        .filter(IngestedUsageEvent.user_id == current_user.id)
        .all()
    )

    def in_range(date_str: str, start: str, end: str = None) -> bool:
        end = end or "9999-12-31"
        return start <= date_str <= end

    def agg_logs(items, start, end=None):
        filtered = [l for l in items if in_range(l.usage_date, start, end or "9999-12-31")]
        return {
            "credits": round(sum(l.credits_used for l in filtered), 4),
            "prompts": sum(l.prompt_count for l in filtered),
            "tokens": sum(l.token_usage for l in filtered),
            "sessions": len(filtered),
        }

    def agg_events(items, start, end=None):
        filtered = [e for e in items if in_range(e.usage_date, start, end or "9999-12-31")]
        return {
            "credits": round(sum(e.credits_used for e in filtered), 4),
            "prompts": sum(e.prompt_count for e in filtered),
            "tokens": sum(e.token_usage for e in filtered),
            "duration_seconds": sum(e.duration_seconds for e in filtered),
            "cost_usd": round(sum(e.cost_usd for e in filtered), 4),
            "sessions": len(filtered),
        }

    # ── Period aggregations (merge both tables) ───────────────────────────────
    def merge(log_agg, evt_agg):
        return {
            "credits": round(log_agg["credits"] + evt_agg["credits"], 4),
            "prompts": log_agg["prompts"] + evt_agg["prompts"],
            "tokens": log_agg["tokens"] + evt_agg["tokens"],
            "sessions": log_agg["sessions"] + evt_agg["sessions"],
            "cost_usd": round(evt_agg.get("cost_usd", 0.0), 4),
            "duration_seconds": evt_agg.get("duration_seconds", 0),
        }

    today_data   = merge(agg_logs(logs, today_str, today_str), agg_events(events, today_str, today_str))
    weekly_data  = merge(agg_logs(logs, week_start_str), agg_events(events, week_start_str))
    monthly_data = merge(agg_logs(logs, month_start_str), agg_events(events, month_start_str))
    total_data   = merge(agg_logs(logs, "0000-01-01"), agg_events(events, "0000-01-01"))

    # ── Most Used AI — highest total prompt count across all time ─────────────
    platform_prompts: dict = {}
    for l in logs:
        platform_prompts[l.platform] = platform_prompts.get(l.platform, 0) + l.prompt_count
    for e in events:
        platform_prompts[e.platform] = platform_prompts.get(e.platform, 0) + e.prompt_count

    most_used_ai = max(platform_prompts, key=lambda p: platform_prompts[p], default=None)

    # ── Favorite AI — highest total session duration from ingested events ──────
    platform_duration: dict = {}
    for e in events:
        platform_duration[e.platform] = platform_duration.get(e.platform, 0) + e.duration_seconds

    favorite_ai = max(platform_duration, key=lambda p: platform_duration[p], default=None)

    # ── Source breakdown ──────────────────────────────────────────────────────
    source_counts: dict = {"manual_entry": len(logs), "official_api": 0, "browser_extension": 0}
    for e in events:
        src = e.source_type
        source_counts[src] = source_counts.get(src, 0) + 1

    # ── Platform distribution (all time, both tables) ─────────────────────────
    platform_dist: dict = {}
    for l in logs:
        if l.platform not in platform_dist:
            platform_dist[l.platform] = {"credits": 0.0, "prompts": 0, "sessions": 0}
        platform_dist[l.platform]["credits"] += l.credits_used
        platform_dist[l.platform]["prompts"] += l.prompt_count
        platform_dist[l.platform]["sessions"] += 1
    for e in events:
        if e.platform not in platform_dist:
            platform_dist[e.platform] = {"credits": 0.0, "prompts": 0, "sessions": 0}
        platform_dist[e.platform]["credits"] += e.credits_used
        platform_dist[e.platform]["prompts"] += e.prompt_count
        platform_dist[e.platform]["sessions"] += 1

    platform_list = sorted(
        [{"platform": p, **v, "credits": round(v["credits"], 4)} for p, v in platform_dist.items()],
        key=lambda x: x["prompts"],
        reverse=True,
    )

    # ── Task type breakdown (from credit_usage_logs) ──────────────────────────
    task_dist: dict = {}
    for l in logs:
        task_dist[l.task_type] = task_dist.get(l.task_type, 0) + 1

    task_list = sorted(
        [{"task_type": t, "count": c} for t, c in task_dist.items()],
        key=lambda x: x["count"],
        reverse=True,
    )

    return {
        "today": today_data,
        "this_week": weekly_data,
        "this_month": monthly_data,
        "total": total_data,
        "most_used_ai": most_used_ai,
        "favorite_ai": favorite_ai,
        "source_breakdown": source_counts,
        "platform_distribution": platform_list,
        "task_distribution": task_list,
        "period": {
            "today": today_str,
            "week_start": week_start_str,
            "month_start": month_start_str,
        },
    }
