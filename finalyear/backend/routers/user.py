"""
User profile router: CRUD operations for user profiles.
FIX: Replaced deprecated .dict() with .model_dump().
FIX: Added proper error handling for all DB operations.
"""
from fastapi import APIRouter, Depends, HTTPException
from backend.routers.auth import get_current_user
from backend.models.user_model import UserProfileUpdate, Project
from backend.database import get_database
from datetime import datetime, timezone
import logging

logger = logging.getLogger("USER_ROUTER")

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    """Get the current user's profile with serialized _id."""
    profile = dict(current_user)
    if "_id" in profile:
        profile["_id"] = str(profile["_id"])
    # Remove sensitive data
    profile.pop("hashed_password", None)
    return profile


@router.post("/profile")
@router.put("/profile")
async def update_profile(profile_update: UserProfileUpdate, current_user=Depends(get_current_user)):
    """Update user profile fields."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    # FIX: Use model_dump() instead of deprecated dict()
    update_data = {k: v for k, v in profile_update.model_dump().items() if v is not None}

    # Convert nested Pydantic models to plain dicts for MongoDB
    if "education" in update_data and update_data["education"]:
        if hasattr(update_data["education"], "model_dump"):
            update_data["education"] = update_data["education"].model_dump()
    if "experience" in update_data and update_data["experience"]:
        if hasattr(update_data["experience"], "model_dump"):
            update_data["experience"] = update_data["experience"].model_dump()

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    try:
        db.users.update_one({"email": current_user["email"]}, {"$set": update_data})
        logger.info(f"✅ Profile updated for {current_user['email']}: {list(update_data.keys())}")
    except Exception as e:
        logger.error(f"❌ Profile update failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

    return {"msg": "Profile updated successfully", "updated_fields": list(update_data.keys())}


@router.post("/add-project")
async def add_project(project: Project, current_user=Depends(get_current_user)):
    """Add a project to user's profile."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # FIX: Use model_dump() instead of deprecated dict()
        db.users.update_one(
            {"email": current_user["email"]},
            {"$push": {"projects": project.model_dump()}}
        )
        logger.info(f"✅ Project '{project.title}' added for {current_user['email']}")
    except Exception as e:
        logger.error(f"❌ Failed to add project: {e}")
        raise HTTPException(status_code=500, detail="Failed to add project")

    return {"msg": "Project added successfully"}


@router.get("/analysis")
async def get_analysis(current_user=Depends(get_current_user)):
    """Retrieve the last saved analysis with AI insights for the current user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    analysis = db.analysis.find_one({"user_email": current_user["email"]})
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found. Please upload your resume first.")

    analysis["_id"] = str(analysis["_id"])

    # Generate insights on-the-fly if not present (backward compatibility)
    if not analysis.get("insights"):
        try:
            from backend.services.insights_service import generate_insights
            insights = generate_insights(analysis)
            analysis["insights"] = insights
            # Cache the generated insights back to MongoDB
            try:
                db.analysis.update_one(
                    {"user_email": current_user["email"]},
                    {"$set": {"insights": insights}}
                )
                logger.info(f"🧠 Insights generated and cached for {current_user['email']}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to cache insights: {e}")
        except Exception as e:
            logger.warning(f"⚠️ Insights generation failed: {e}")
            analysis["insights"] = None

    return analysis
