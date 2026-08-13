"""
Recommendations Router — /api/v1/recommendations

Scaffolded for Phase 2 ML integration.
Returns rule-based recommendations in Phase 1.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.models.credit import CreditEntry

router = APIRouter()


@router.get("/")
def get_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Rule-based recommendations for Phase 1.
    Phase 2 will replace with ML model (scikit-learn / XGBoost).
    """
    rows = (
        db.query(
            CreditEntry.service_slug,
            CreditEntry.service_name,
            func.sum(CreditEntry.credits_used).label("total_used"),
            func.sum(CreditEntry.credits_remaining).label("total_remaining"),
            func.sum(CreditEntry.cost_usd).label("total_cost"),
        )
        .filter(CreditEntry.user_id == current_user.id)
        .group_by(CreditEntry.service_slug, CreditEntry.service_name)
        .all()
    )

    recommendations = []

    for r in rows:
        remaining = float(r.total_remaining or 0)
        used = float(r.total_used or 0)
        total = used + remaining

        if total > 0:
            usage_pct = (used / total) * 100
        else:
            usage_pct = 0

        if usage_pct >= 90:
            recommendations.append({
                "service": r.service_name,
                "type": "warning",
                "message": f"⚠️ {r.service_name} credits are {usage_pct:.0f}% depleted. Consider upgrading your plan.",
                "priority": "high",
            })
        elif usage_pct >= 70:
            recommendations.append({
                "service": r.service_name,
                "type": "info",
                "message": f"📊 {r.service_name} usage is at {usage_pct:.0f}%. Monitor closely.",
                "priority": "medium",
            })

    if not recommendations:
        recommendations.append({
            "service": "all",
            "type": "success",
            "message": "✅ All your AI credits are within healthy usage levels.",
            "priority": "low",
        })

    return {"recommendations": recommendations, "count": len(recommendations)}
