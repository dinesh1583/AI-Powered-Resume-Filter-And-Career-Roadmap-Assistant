"""
Resume upload and AI analysis router.
FIX: Replaced deprecated datetime.utcnow() with timezone-aware datetime.now(timezone.utc).
FIX: Added better error messages and edge case handling.
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from backend.routers.auth import get_current_user
from backend.database import get_database
from datetime import datetime, timezone
import logging

logger = logging.getLogger("RESUME_ROUTER")

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    """
    Complete AI analysis pipeline:
    1. Extract text from PDF
    2. NLP skill extraction (NO hardcoded fallbacks)
    3. Merge with user profile skills
    4. Career matching
    5. Skill gap analysis
    6. Roadmap generation
    7. Recommendations
    8. Save everything to MongoDB
    """
    from backend.services.nlp_service import extract_skills_from_text, get_skill_categories
    from backend.services.career_service import match_careers
    from backend.services.recommendation_service import get_recommendations
    from backend.services.roadmap_service import generate_roadmap_steps
    import pdfplumber
    import io

    logger.info(f"📄 Resume upload started for {current_user['email']}: {file.filename}")

    # Step 1: Read the entire file content ONCE
    content = await file.read()
    logger.info(f"📄 Read {len(content)} bytes from {file.filename}")

    # Step 2: Extract text from PDF
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text(x_tolerance=2, y_tolerance=3)
                if page_text:
                    text += page_text + " \n "
            logger.info(f"📄 Extracted {len(text)} chars from PDF ({len(pdf.pages)} pages)")
    except Exception as e:
        logger.warning(f"⚠️ PDF parsing failed: {e}")
        text = ""

    # Step 2b: Fallback to plain text if PDF parsing fails
    if not text.strip():
        try:
            text = content.decode('utf-8', errors='ignore')
            logger.info(f"📄 Fallback to plain text: {len(text)} chars")
        except Exception as e:
            logger.error(f"❌ Text decoding also failed: {e}")
            text = ""

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the uploaded file. Please upload a valid PDF resume."
        )

    # Step 3: NLP Skill Extraction — NO fallbacks, extract ONLY what's in the resume
    resume_skills = extract_skills_from_text(text)
    logger.info(f"🧠 Resume skills extracted: {resume_skills}")

    # Step 4: Use only the skills extracted from this specific resume
    user_profile_skills = current_user.get("skills", [])
    merged_skills = sorted(list(set(resume_skills)))
    logger.info(f"🔀 Extracted {len(merged_skills)} skills from resume: {merged_skills}")

    if not merged_skills:
        raise HTTPException(
            status_code=422,
            detail="No skills could be detected from your resume. Please ensure your resume contains technical skills and is in a readable PDF format."
        )

    # Step 5: Get skill categories
    skill_categories = get_skill_categories(merged_skills)

    # Step 6: Match Careers (top 3)
    matched_careers = match_careers(merged_skills, top_n=5)
    logger.info(f"🎯 Career matches: {[(c['title'], c['match_score']) for c in matched_careers]}")

    if not matched_careers:
        raise HTTPException(
            status_code=422,
            detail="Could not match any careers. The detected skills may not map to careers in our database."
        )

    best_career = matched_careers[0]

    # Step 7: Get recommendations for best career
    recommendations = get_recommendations(
        merged_skills,
        best_career["title"],
        best_career.get("missing_skills", [])
    )

    # Step 8: Generate roadmap for best career
    roadmap = generate_roadmap_steps(
        best_career["title"],
        merged_skills,
        best_career.get("missing_skills", [])
    )

    # Step 9: Build the complete analysis result
    # FIX: Use timezone-aware UTC datetime
    now = datetime.now(timezone.utc).isoformat()
    analysis_result = {
        "user_email": current_user["email"],
        "resume_filename": file.filename,
        "resume_text_length": len(text),
        "resume_skills": resume_skills,
        "profile_skills": user_profile_skills,
        "skills": merged_skills,
        "skill_count": len(merged_skills),
        "skill_categories": skill_categories,
        "matched_careers": matched_careers,
        "best_match": best_career,
        "alternate_careers": matched_careers[1:] if len(matched_careers) > 1 else [],
        "recommendations": recommendations,
        "roadmap": roadmap,
        "analyzed_at": now,
    }

    # Step 9b: Generate AI Insights
    try:
        from backend.services.insights_service import generate_insights
        ai_insights = generate_insights(analysis_result)
        analysis_result["insights"] = ai_insights
        logger.info(f"🧠 AI insights generated: readiness={ai_insights['career_readiness_score']}")
    except Exception as e:
        logger.warning(f"⚠️ Insights generation failed: {e}")
        analysis_result["insights"] = None

    # Step 10: Save to MongoDB
    db = get_database()
    if db is not None:
        try:
            # Update user skills
            db.users.update_one(
                {"email": current_user["email"]},
                {"$set": {
                    "skills": merged_skills,
                    "resume_url": file.filename,
                    "skill_categories": skill_categories,
                    "best_career_match": best_career["title"],
                    "career_match_score": best_career["match_score"],
                    "last_analysis_at": now,
                }}
            )

            # Save full analysis to analysis collection
            db.analysis.update_one(
                {"user_email": current_user["email"]},
                {"$set": analysis_result},
                upsert=True
            )

            # Save roadmap to roadmap collection
            db.roadmaps.update_one(
                {"user_email": current_user["email"]},
                {"$set": {
                    "user_email": current_user["email"],
                    "target_career": roadmap["career"],
                    "match_percentage": best_career["match_score"],
                    "total_duration_weeks": roadmap["total_duration_weeks"],
                    "completed_steps": roadmap["completed_steps"],
                    "total_steps": roadmap["total_steps"],
                    "steps": roadmap["steps"],
                    "projects": roadmap["projects"],
                    "recommendations": recommendations,
                    "updated_at": now,
                }},
                upsert=True
            )

            logger.info(f"💾 Analysis saved to MongoDB for {current_user['email']}")
        except Exception as e:
            logger.error(f"❌ MongoDB save failed: {e}")
    else:
        logger.warning("⚠️ Database not available, results not persisted")

    logger.info(f"✅ Analysis complete for {current_user['email']}: {len(merged_skills)} skills, best match: {best_career['title']} ({best_career['match_score']}%)")

    return {
        "msg": "Resume analyzed successfully",
        "skills": merged_skills,
        "skill_count": len(merged_skills),
        "skill_categories": skill_categories,
        "matched_careers": matched_careers,
        "best_match": best_career,
        "alternate_careers": matched_careers[1:] if len(matched_careers) > 1 else [],
        "recommendations": recommendations,
        "roadmap": roadmap,
        "resume_text_length": len(text),
        "insights": analysis_result.get("insights")
    }
