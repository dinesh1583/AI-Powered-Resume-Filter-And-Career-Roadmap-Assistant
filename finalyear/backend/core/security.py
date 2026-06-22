"""
Security module: JWT token management and password hashing.
FIX: Uses datetime.timezone.utc instead of deprecated datetime.utcnow().
"""
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt
from core.config import settings
import logging

logger = logging.getLogger("SECURITY")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        plain_password_bytes = plain_password.encode('utf-8')[:72]  # bcrypt max 72 bytes
        hashed_password_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt with 12 rounds."""
    password_bytes = password.encode('utf-8')[:72]  # bcrypt max 72 bytes
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with expiration."""
    # FIX: Use timezone-aware UTC datetime instead of deprecated utcnow()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
