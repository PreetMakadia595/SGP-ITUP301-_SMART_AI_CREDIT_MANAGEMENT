"""
Credit Log Service — CRUD and analytics aggregation operations for CreditUsageLog.
"""
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from fastapi import HTTPException, status

from app.models.credit_log import CreditUsageLog
from app.schemas.credit_log import (
    CreditUsageLogCreate,
    CreditUsageLogUpdate,
    ChartDataPoint,
    DistributionPoint,
    CreditChartsResponse,
)


class CreditLogService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, data: CreditUsageLogCreate) -> CreditUsageLog:
        log = CreditUsageLog(user_id=user_id, **data.model_dump())
        self.db.add(log)

        # Also create or update summarized CreditEntry
        from app.models.credit import CreditEntry
        slug = data.platform.lower().replace(" ", "-")
        entry = (
            self.db.query(CreditEntry)
            .filter(CreditEntry.user_id == user_id, CreditEntry.service_slug == slug)
            .first()
        )
        if not entry:
            entry = CreditEntry(
                user_id=user_id,
                service_slug=slug,
                service_name=data.platform,
                credits_used=data.credits_used,
                credits_remaining=max(0.0, 100.0 - data.credits_used),
                credits_total=100.0,
                cost_usd=round(data.credits_used * 0.2, 2),
                notes=data.notes,
            )
            self.db.add(entry)
        else:
            entry.credits_used += data.credits_used
            entry.credits_remaining = max(0.0, entry.credits_remaining - data.credits_used)

        self.db.commit()
        self.db.refresh(log)

        # Trigger ML pipeline update
        try:
            from app.services.ml_service import MLPredictionEngine
            MLPredictionEngine(self.db).update_predictions_for_user(user_id)
        except Exception:
            pass

        return log

    def list_by_user(
        self,
        user_id: int,
        search: Optional[str] = None,
        platform: Optional[str] = None,
        task_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[CreditUsageLog], int]:
        query = self.db.query(CreditUsageLog).filter(CreditUsageLog.user_id == user_id)

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CreditUsageLog.project_name.ilike(search_pattern),
                    CreditUsageLog.model.ilike(search_pattern),
                    CreditUsageLog.notes.ilike(search_pattern),
                    CreditUsageLog.platform.ilike(search_pattern),
                )
            )

        if platform and platform.lower() != "all":
            query = query.filter(CreditUsageLog.platform.ilike(platform))

        if task_type and task_type.lower() != "all":
            query = query.filter(CreditUsageLog.task_type.ilike(task_type))

        if start_date:
            query = query.filter(CreditUsageLog.usage_date >= start_date)

        if end_date:
            query = query.filter(CreditUsageLog.usage_date <= end_date)

        total = query.count()
        logs = (
            query.order_by(desc(CreditUsageLog.usage_date), desc(CreditUsageLog.id))
            .offset(skip)
            .limit(limit)
            .all()
        )

        return logs, total

    def get_by_id(self, log_id: int, user_id: int) -> CreditUsageLog:
        log = (
            self.db.query(CreditUsageLog)
            .filter(CreditUsageLog.id == log_id, CreditUsageLog.user_id == user_id)
            .first()
        )
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit usage log not found",
            )
        return log

    def update(self, log_id: int, user_id: int, data: CreditUsageLogUpdate) -> CreditUsageLog:
        log = self.get_by_id(log_id, user_id)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(log, field, value)
        self.db.commit()
        self.db.refresh(log)
        return log

    def delete(self, log_id: int, user_id: int) -> None:
        log = self.get_by_id(log_id, user_id)
        self.db.delete(log)
        self.db.commit()

    def get_charts_data(self, user_id: int) -> CreditChartsResponse:
        logs = (
            self.db.query(CreditUsageLog)
            .filter(CreditUsageLog.user_id == user_id)
            .order_by(asc(CreditUsageLog.usage_date))
            .all()
        )

        total_credits = sum(l.credits_used for l in logs)
        total_prompts = sum(l.prompt_count for l in logs)
        total_tokens = sum(l.token_usage for l in logs)
        total_logs = len(logs)

        # ── Daily Aggregation ──
        daily_map: Dict[str, Dict[str, Any]] = {}
        for l in logs:
            d = l.usage_date
            if d not in daily_map:
                daily_map[d] = {"credits": 0.0, "prompts": 0, "tokens": 0}
            daily_map[d]["credits"] += l.credits_used
            daily_map[d]["prompts"] += l.prompt_count
            daily_map[d]["tokens"] += l.token_usage

        daily_points = [
            ChartDataPoint(
                label=d,
                credits_used=round(daily_map[d]["credits"], 2),
                prompt_count=daily_map[d]["prompts"],
                token_usage=daily_map[d]["tokens"],
            )
            for d in sorted(daily_map.keys())
        ]

        # ── Weekly Aggregation (YYYY-Www) ──
        weekly_map: Dict[str, Dict[str, Any]] = {}
        for l in logs:
            try:
                dt = datetime.strptime(l.usage_date, "%Y-%m-%d")
                year, week, _ = dt.isocalendar()
                w_key = f"{year}-W{week:02d}"
            except ValueError:
                w_key = l.usage_date[:7]

            if w_key not in weekly_map:
                weekly_map[w_key] = {"credits": 0.0, "prompts": 0, "tokens": 0}
            weekly_map[w_key]["credits"] += l.credits_used
            weekly_map[w_key]["prompts"] += l.prompt_count
            weekly_map[w_key]["tokens"] += l.token_usage

        weekly_points = [
            ChartDataPoint(
                label=w,
                credits_used=round(weekly_map[w]["credits"], 2),
                prompt_count=weekly_map[w]["prompts"],
                token_usage=weekly_map[w]["tokens"],
            )
            for w in sorted(weekly_map.keys())
        ]

        # ── Monthly Aggregation (YYYY-MM) ──
        monthly_map: Dict[str, Dict[str, Any]] = {}
        for l in logs:
            m_key = l.usage_date[:7] if len(l.usage_date) >= 7 else l.usage_date
            if m_key not in monthly_map:
                monthly_map[m_key] = {"credits": 0.0, "prompts": 0, "tokens": 0}
            monthly_map[m_key]["credits"] += l.credits_used
            monthly_map[m_key]["prompts"] += l.prompt_count
            monthly_map[m_key]["tokens"] += l.token_usage

        monthly_points = [
            ChartDataPoint(
                label=m,
                credits_used=round(monthly_map[m]["credits"], 2),
                prompt_count=monthly_map[m]["prompts"],
                token_usage=monthly_map[m]["tokens"],
            )
            for m in sorted(monthly_map.keys())
        ]

        # ── Platform Breakdown ──
        platform_map: Dict[str, float] = {}
        for l in logs:
            platform_map[l.platform] = platform_map.get(l.platform, 0.0) + l.credits_used

        platform_breakdown = [
            DistributionPoint(
                name=p,
                credits_used=round(c, 2),
                percentage=round((c / total_credits * 100), 1) if total_credits > 0 else 0.0,
            )
            for p, c in sorted(platform_map.items(), key=lambda x: x[1], reverse=True)
        ]

        # ── Task Type Breakdown ──
        task_map: Dict[str, float] = {}
        for l in logs:
            task_map[l.task_type] = task_map.get(l.task_type, 0.0) + l.credits_used

        task_breakdown = [
            DistributionPoint(
                name=t,
                credits_used=round(c, 2),
                percentage=round((c / total_credits * 100), 1) if total_credits > 0 else 0.0,
            )
            for t, c in sorted(task_map.items(), key=lambda x: x[1], reverse=True)
        ]

        return CreditChartsResponse(
            daily=daily_points,
            weekly=weekly_points,
            monthly=monthly_points,
            platform_breakdown=platform_breakdown,
            task_breakdown=task_breakdown,
            total_credits=round(total_credits, 2),
            total_prompts=total_prompts,
            total_tokens=total_tokens,
            total_logs=total_logs,
        )
