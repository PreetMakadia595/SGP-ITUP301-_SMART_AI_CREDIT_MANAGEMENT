"""
Security Utilities

- Password hashing with bcrypt (via passlib)
- JWT creation and decoding (via python-jose)
- Symmetric API Key encryption and decryption (via cryptography.fernet)
"""
import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet

from app.config import settings

# ── Password Hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: Dict[str, Any]) -> str:
    """Create a short-lived JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a long-lived JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token. Returns payload dict or None."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


# ── API Key Symmetric Encryption / Decryption ─────────────────────────────────
def _get_fernet() -> Fernet:
    """Derive a valid 32-byte URL-safe base64 key from JWT_SECRET_KEY."""
    key_bytes = hashlib.sha256(settings.JWT_SECRET_KEY.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)


def encrypt_api_key(raw_api_key: Optional[str]) -> Optional[str]:
    """Encrypt raw API key string using Fernet."""
    if not raw_api_key:
        return None
    f = _get_fernet()
    return f.encrypt(raw_api_key.encode()).decode()


def decrypt_api_key(encrypted_api_key: Optional[str]) -> Optional[str]:
    """Decrypt stored encrypted API key string using Fernet."""
    if not encrypted_api_key:
        return None
    try:
        f = _get_fernet()
        return f.decrypt(encrypted_api_key.encode()).decode()
    except Exception:
        return None


def mask_api_key(raw_api_key: Optional[str]) -> Optional[str]:
    """Return a masked preview of an API key (e.g. sk-proj-...1234)."""
    if not raw_api_key:
        return None
    cleaned = raw_api_key.strip()
    if len(cleaned) <= 8:
        return "••••••••"
    return f"{cleaned[:4]}••••••••{cleaned[-4:]}"
