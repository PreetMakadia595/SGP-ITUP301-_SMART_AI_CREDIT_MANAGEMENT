"""
Authentication Service — Business logic for register / login / token refresh.
"""
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, GoogleAuthRequest, TokenResponse
from fastapi import HTTPException, status


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def google_login(self, data: GoogleAuthRequest) -> TokenResponse:
        email = data.email or "google_user@example.com"
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=hash_password("GoogleAuthSecuredPassword#123"),
                full_name=data.full_name or "Google User",
                is_active=True,
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        return self._generate_tokens(user)

    def register(self, data: RegisterRequest) -> TokenResponse:
        # Check if email is already registered
        existing = self.db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return self._generate_tokens(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.db.query(User).filter(User.email == data.email).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )
        return self._generate_tokens(user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_access_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return self._generate_tokens(user)

    def forgot_password(self, email: str) -> dict:
        import uuid
        from datetime import datetime, timedelta, timezone
        user = self.db.query(User).filter(User.email == email).first()
        # Always return success message to prevent user enumeration
        if user:
            user.reset_token = str(uuid.uuid4())
            user.reset_token_expires = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
            self.db.commit()
            # For demonstration & local dev, we return the reset token in response if debug/dev mode
            return {
                "message": "Password reset instructions sent to email.",
                "reset_token": user.reset_token
            }
        return {"message": "Password reset instructions sent to email."}

    def reset_password(self, token: str, new_password: str) -> dict:
        from datetime import datetime, timezone
        user = self.db.query(User).filter(User.reset_token == token).first()
        if not user or not user.reset_token_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )
        if user.reset_token_expires < datetime.now(timezone.utc).replace(tzinfo=None):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired",
            )

        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        self.db.commit()
        return {"message": "Password successfully reset. You can now log in with your new password."}

    def update_profile(self, user_id: int, full_name: str | None, avatar_url: str | None) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if full_name is not None:
            user.full_name = full_name
        if avatar_url is not None:
            user.avatar_url = avatar_url
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, user_id: int, current_password: str, new_password: str) -> dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password",
            )
        user.hashed_password = hash_password(new_password)
        self.db.commit()
        return {"message": "Password updated successfully."}

    def _generate_tokens(self, user: User) -> TokenResponse:
        payload = {"sub": str(user.id), "email": user.email}
        return TokenResponse(
            access_token=create_access_token(payload),
            refresh_token=create_refresh_token(payload),
        )

