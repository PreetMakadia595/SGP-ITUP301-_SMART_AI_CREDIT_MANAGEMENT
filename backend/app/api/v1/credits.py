"""
Credits Router — /api/v1/credits

Full CRUD + service summary endpoint.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.credit import CreditEntryCreate, CreditEntryRead, CreditEntryUpdate
from app.services.credit_service import CreditService

router = APIRouter()


@router.get("/", response_model=List[CreditEntryRead])
def list_credits(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return CreditService(db).list_by_user(current_user.id, skip, limit)


@router.post("/", response_model=CreditEntryRead, status_code=201)
def create_credit(
    data: CreditEntryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return CreditService(db).create(current_user.id, data)


@router.get("/summary")
def credit_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Returns aggregated credit usage/remaining grouped by AI service."""
    return CreditService(db).get_summary_by_service(current_user.id)


@router.get("/{entry_id}", response_model=CreditEntryRead)
def get_credit(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return CreditService(db).get_by_id(entry_id, current_user.id)


@router.patch("/{entry_id}", response_model=CreditEntryRead)
def update_credit(
    entry_id: int,
    data: CreditEntryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = CreditService(db)
    entry = svc.get_by_id(entry_id, current_user.id)
    return svc.update(entry, data)


@router.delete("/{entry_id}", status_code=204)
def delete_credit(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    svc = CreditService(db)
    entry = svc.get_by_id(entry_id, current_user.id)
    svc.delete(entry)
