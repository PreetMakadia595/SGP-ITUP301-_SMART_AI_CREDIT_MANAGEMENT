"""
Credit Service — CRUD operations for CreditEntry model.
"""
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.credit import CreditEntry
from app.schemas.credit import CreditEntryCreate, CreditEntryUpdate


class CreditService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, data: CreditEntryCreate) -> CreditEntry:
        entry = CreditEntry(user_id=user_id, **data.model_dump())
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def list_by_user(self, user_id: int, skip: int = 0, limit: int = 50) -> List[CreditEntry]:
        return (
            self.db.query(CreditEntry)
            .filter(CreditEntry.user_id == user_id)
            .order_by(CreditEntry.recorded_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, entry_id: int, user_id: int) -> CreditEntry:
        entry = (
            self.db.query(CreditEntry)
            .filter(CreditEntry.id == entry_id, CreditEntry.user_id == user_id)
            .first()
        )
        if not entry:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit entry not found")
        return entry

    def update(self, entry: CreditEntry, data: CreditEntryUpdate) -> CreditEntry:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(entry, field, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete(self, entry: CreditEntry) -> None:
        self.db.delete(entry)
        self.db.commit()

    def get_summary_by_service(self, user_id: int) -> dict:
        """Return total credits used/remaining grouped by service."""
        from sqlalchemy import func as sa_func
        rows = (
            self.db.query(
                CreditEntry.service_slug,
                CreditEntry.service_name,
                sa_func.sum(CreditEntry.credits_used).label("total_used"),
                sa_func.sum(CreditEntry.credits_remaining).label("total_remaining"),
                sa_func.sum(CreditEntry.cost_usd).label("total_cost"),
            )
            .filter(CreditEntry.user_id == user_id)
            .group_by(CreditEntry.service_slug, CreditEntry.service_name)
            .all()
        )
        return [
            {
                "service_slug": r.service_slug,
                "service_name": r.service_name,
                "total_used": float(r.total_used or 0),
                "total_remaining": float(r.total_remaining or 0),
                "total_cost": float(r.total_cost or 0),
            }
            for r in rows
        ]
