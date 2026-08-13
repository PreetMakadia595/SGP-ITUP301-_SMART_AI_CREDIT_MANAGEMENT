"""
User Pydantic Schemas
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    email: str
    full_name: str | None
    is_active: bool
    is_superuser: bool
    avatar_url: str | None
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None


UserResponse = UserRead

