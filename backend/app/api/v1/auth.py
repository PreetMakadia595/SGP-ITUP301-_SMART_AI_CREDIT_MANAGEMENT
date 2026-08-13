"""
Auth Router — /api/v1/auth

Endpoints:
  POST /register        — Create a new user account
  POST /login           — Authenticate and get JWT tokens
  POST /logout          — Invalidate session / confirm logout
  POST /refresh         — Refresh access token using refresh token
  POST /forgot-password — Initiate password reset email/token
  POST /reset-password  — Complete password reset with token
  GET  /me              — Get current user profile
  PUT  /profile         — Update profile details
  POST /change-password — Change user password
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    MessageResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and return JWT tokens."""
    return AuthService(db).register(data)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    return AuthService(db).login(data)


@router.post("/google", response_model=TokenResponse)
def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate user via Google OAuth."""
    return AuthService(db).google_login(data)


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout current session."""
    return {"message": "Logged out successfully."}


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    """Use a refresh token to obtain a new access token."""
    return AuthService(db).refresh(data.refresh_token)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset token."""
    return AuthService(db).forgot_password(data.email)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid reset token."""
    return AuthService(db).reset_password(data.token, data.new_password)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile information."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile details (full_name, avatar_url)."""
    return AuthService(db).update_profile(current_user.id, data.full_name, data.avatar_url)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change user password while logged in."""
    return AuthService(db).change_password(current_user.id, data.current_password, data.new_password)
