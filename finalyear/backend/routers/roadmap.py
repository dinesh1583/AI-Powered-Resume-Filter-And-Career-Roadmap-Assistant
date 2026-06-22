"""
Roadmap router: Generate, retrieve, and update career roadmaps.
FIX: Added null checks for database on all routes.
FIX: Added proper error handling and logging.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from routers.auth import get_current_user
from models.roadmap_model import Roadmap, StepUpdate
from database import get_database
import logging

logger = logging.getLogger("ROADMAP_ROUTER")

router = APIRouter()


@router.post("/generate")
async def generate_roadmap(target_career: str = Query(...), current_user=Depends(get_current_user)):
    """Generate a personalized career roadmap for the target career."""
    from services.roadmap_service import generate_roadmap_steps
    from services.career_service import match_careers
    from services.recommendation_service import get_recommendations

    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    user_skills = current_user.get("skills", [])
    if not user_skills:
        raise HTTPException(
            status_code=422,
            detail="No skills found. Please upload your resume or add skills to your profile first."
        )

    # Get career match info
    matched = match_careers(user_skills, top_n=1)
    best = matched[0] if matched else {"match_score": 50, "missing_skills": []}

    # Generate roadmap
    roadmap_data = generate_roadmap_steps(target_career, user_skills, best.get("missing_skills", []))

    # Get recommendations
    recs = get_recommendations(user_skills, target_career, best.get("missing_skills", []))

    roadmap = {
        "user_email": current_user["email"],
        "target_career": roadmap_data["career"],
        "match_percentage": best["match_score"],
        "total_duration_weeks": roadmap_data["total_duration_weeks"],
        "completed_steps": roadmap_data["completed_steps"],
        "total_steps": roadmap_data["total_steps"],
        "steps": roadmap_data["steps"],
        "projects": roadmap_data["projects"],
        "recommendations": recs
    }

    try:
        db.roadmaps.update_one(
            {"user_email": current_user["email"]},
            {"$set": roadmap},
            upsert=True
        )
        logger.info(f"✅ Roadmap generated for {current_user['email']}: {target_career}")
    except Exception as e:
        logger.error(f"❌ Roadmap save failed: {e}")
        # Still return the roadmap even if save fails
    
    return roadmap


@router.get("/{user_email}")
async def get_roadmap(user_email: str, current_user=Depends(get_current_user)):
    """Retrieve a user's saved roadmap."""
    if user_email != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    db = get_database()
    # FIX: Added null check — was crashing when DB unavailable
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    roadmap = db.roadmaps.find_one({"user_email": user_email})
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found. Upload your resume first.")

    roadmap["_id"] = str(roadmap["_id"])
    return roadmap


@router.put("/update-step")
async def update_step(step_update: StepUpdate, current_user=Depends(get_current_user)):
    """Mark a roadmap step as completed/uncompleted."""
    db = get_database()
    # FIX: Added null check — was crashing when DB unavailable
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = db.roadmaps.update_one(
            {"user_email": current_user["email"], "steps.id": step_update.step_id},
            {"$set": {"steps.$.is_completed": step_update.is_completed}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Step not found in roadmap")
        logger.info(f"✅ Step {step_update.step_id} updated for {current_user['email']}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Step update failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update step")

    return {"msg": "Step updated successfully"}
