"""
Authentication router: Registration, Login, JWT token management.
FIX: Replaced deprecated .dict() with .model_dump().
FIX: Added input validation (password length check on register).
FIX: Added proper error handling for all DB operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models.user_model import UserCreate, UserLogin
from core.security import verify_password, get_password_hash, create_access_token
from database import get_database
from typing import Annotated
from datetime import datetime, timezone
import logging

logger = logging.getLogger("AUTH")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Decode JWT token and return the current user from database.
    Used as a dependency in protected routes.
    """
    from jose import jwt, JWTError
    from core.config import settings
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
    except JWTError as e:
        logger.warning(f"JWT decode failed: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    email = email.lower()
    user = db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Serialize _id to string for JSON compatibility
    user["_id"] = str(user["_id"])
    return user


@router.post("/register")
async def register(user: UserCreate):
    """Register a new user with email and password."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    # Input validation
    if len(user.password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters")
    if len(user.full_name.strip()) < 2:
        raise HTTPException(status_code=422, detail="Full name must be at least 2 characters")

    email = user.email.lower()
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # FIX: Use model_dump() instead of deprecated dict()
    user_dict = user.model_dump()
    user_dict["email"] = email
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["skills"] = []
    user_dict["projects"] = []
    user_dict["about_me"] = ""
    user_dict["education"] = {}
    user_dict["experience"] = {"level": "Fresher", "years": 0}
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()

    try:
        result = db.users.insert_one(user_dict)
        logger.info(f"✅ User registered: {email}")
    except Exception as e:
        logger.error(f"❌ Registration DB error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed due to a server error")

    return {"email": email, "full_name": user.full_name, "msg": "Registration successful"}


@router.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """Authenticate user and return JWT access token."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    email = form_data.username.lower()
    user = db.users.find_one({"email": email})

    if not user:
        logger.warning(f"Login attempt for non-existent email: {email}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not verify_password(form_data.password, user.get("hashed_password", "")):
        logger.warning(f"Failed login attempt for: {email}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(subject=user["email"])
    logger.info(f"✅ User logged in: {user['email']}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """Return the current authenticated user's profile (without password)."""
    # Remove sensitive data
    safe_user = {k: v for k, v in current_user.items() if k != "hashed_password"}
    return safe_user
