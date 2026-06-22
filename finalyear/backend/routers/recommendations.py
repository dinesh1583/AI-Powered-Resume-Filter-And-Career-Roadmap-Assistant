"""
Recommendations Router: Get personalized course, video, and project recommendations.
FIX: Added logging and improved error messages.
"""
from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from services.recommendation_service import get_recommendations
from services.career_service import match_careers
import logging

logger = logging.getLogger("RECOMMENDATIONS_ROUTER")

router = APIRouter()


@router.get("/")
async def recommendations(current_user=Depends(get_current_user)):
    """Get personalized recommendations based on user skills and career matches."""
    user_skills = current_user.get("skills", [])

    if not user_skills:
        raise HTTPException(
            status_code=404,
            detail="No skills found. Please upload your resume or add skills to your profile first."
        )

    matched = match_careers(user_skills, top_n=3)

    if not matched:
        raise HTTPException(
            status_code=404,
            detail="Could not find career matches for your skills. Try adding more skills."
        )

    target_career = matched[0]["title"]
    missing_skills = matched[0].get("missing_skills", [])

    recs = get_recommendations(user_skills, target_career, missing_skills)
    recs["target_career"] = target_career
    recs["user_skills"] = user_skills
    recs["missing_skills"] = missing_skills

    logger.info(f"📚 Recommendations served for {current_user['email']}: "
                f"career='{target_career}', {recs['total_courses']} courses, "
                f"{recs['total_videos']} videos, {recs['total_projects']} projects")

    return recs
