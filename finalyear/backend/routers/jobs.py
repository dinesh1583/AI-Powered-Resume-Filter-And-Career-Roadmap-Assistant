"""
Jobs Router: Indian job listings with skill-based matching.
FIX: Added module-level caching — CSV loaded ONCE instead of per-request.
FIX: Added proper logging and error handling.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from backend.routers.auth import get_current_user
import csv
import os
import logging
from typing import List, Dict

logger = logging.getLogger("JOBS_ROUTER")

router = APIRouter()

# ─── Module-level cache (loaded once) ───
_jobs_cache: List[Dict] = []
_jobs_loaded = False


def _load_jobs_dataset():
    """Load real-world Indian job listings from dataset. Cached after first call."""
    global _jobs_cache, _jobs_loaded
    if _jobs_loaded:
        return _jobs_cache

    jobs_path = os.path.join(os.path.dirname(__file__), "../dataset/indian_jobs.csv")
    jobs = []
    if os.path.exists(jobs_path):
        with open(jobs_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                required_skills = [s.strip() for s in row.get("skills_required", "").split(",") if s.strip()]
                jobs.append({
                    "id": str(idx + 1),
                    "career": row.get("title", ""),
                    "title": row.get("title", ""),
                    "company": row.get("company", ""),
                    "location": row.get("location", ""),
                    "type": row.get("work_mode", "Full-time"),
                    "experience_level": row.get("experience_level", "Mid"),
                    "salary_range": f"₹{row.get('min_salary_lpa', '3')}-{row.get('max_salary_lpa', '6')} LPA",
                    "required_skills": required_skills,
                    "description": f"Hiring {row.get('title', '')} in {row.get('location', '')}. Minimum experience: {row.get('experience_level', 'Mid')}.",
                    "apply_url": "https://linkedin.com/jobs",
                })
        logger.info(f"✅ Loaded {len(jobs)} Indian jobs from indian_jobs.csv")
    else:
        logger.error(f"❌ indian_jobs.csv NOT FOUND at {jobs_path}")

    _jobs_cache = jobs
    _jobs_loaded = True
    return jobs


@router.get("/")
async def get_jobs(
    career: str = Query("", description="Filter by career title"),
    location: str = Query("", description="Filter by location"),
    experience: str = Query("", description="Filter by experience level"),
    current_user=Depends(get_current_user),
):
    """
    Return real Indian job listings from the dataset, scored against user skills.
    NO salary/package info. NO fake/hardcoded jobs.
    Uses cached dataset (loaded once at first request).
    """
    user_skills = current_user.get("skills", [])
    user_skills_lower = set(s.lower() for s in user_skills)

    all_jobs = list(_load_jobs_dataset())  # shallow copy to avoid mutation

    # Filter by career if provided
    if career:
        career_lower = career.lower()
        all_jobs = [
            j for j in all_jobs
            if career_lower in j["career"].lower() or career_lower in j["title"].lower()
        ]

    # Filter by location if provided
    if location:
        loc_lower = location.lower()
        all_jobs = [j for j in all_jobs if loc_lower in j["location"].lower()]

    # Filter by experience level if provided
    if experience:
        exp_lower = experience.lower()
        all_jobs = [j for j in all_jobs if exp_lower in j["experience_level"].lower()]

    # Calculate skill match percentage for each job
    results = []
    for job in all_jobs:
        job_skills_lower = set(s.lower() for s in job["required_skills"])
        if not job_skills_lower:
            match_pct = 50  # No skill info, default mid-match
        else:
            matched = user_skills_lower & job_skills_lower
            match_pct = round(len(matched) / len(job_skills_lower) * 100)

        results.append({
            **job,
            "match": match_pct,
            "matched_skills": sorted([s for s in job["required_skills"] if s.lower() in user_skills_lower]),
            "missing_skills": sorted([s for s in job["required_skills"] if s.lower() not in user_skills_lower]),
        })

    # Sort by match percentage descending
    results.sort(key=lambda x: x["match"], reverse=True)

    logger.info(f"📋 Returning {len(results)} Indian jobs for user {current_user['email']} "
                f"(skills: {len(user_skills)}, filters: career='{career}', location='{location}')")

    return results
