"""
Industry Trends Router — Endpoints for trending careers, skills, and market data.
"""
from fastapi import APIRouter, Query
from typing import Optional, List
from backend.services.trend_service import (
    get_trending_careers, get_hot_skills,
    get_ai_risk_data, get_salary_trends,
    get_top_companies, get_platform_stats
)
import logging

logger = logging.getLogger("TRENDS_ROUTER")
router = APIRouter()


@router.get("/careers")
async def trending_careers(
    limit: int = Query(default=10, le=31),
    category: Optional[str] = None
):
    """Return trending careers in India, optionally filtered by category."""
    return get_trending_careers(limit=limit, category=category)


@router.get("/skills")
async def hot_skills(category: Optional[str] = None):
    """Return hot skills by category."""
    return get_hot_skills(category=category)


@router.get("/ai-risk")
async def ai_replacement_risk():
    """Return AI replacement risk data per career."""
    return {"data": get_ai_risk_data(), "last_updated": "May 2026"}


@router.get("/salary")
async def salary_trends(careers: Optional[str] = None):
    """Return salary trend data. Pass careers as comma-separated string."""
    career_list = [c.strip() for c in careers.split(",")] if careers else None
    return get_salary_trends(career_list)


@router.get("/companies")
async def top_companies(
    tier: Optional[str] = None,
    limit: int = Query(default=15, le=50)
):
    """Return top hiring companies in India."""
    return get_top_companies(tier=tier, limit=limit)


@router.get("/stats")
async def platform_stats():
    """Return platform-level statistics."""
    return get_platform_stats()


@router.get("/summary")
async def trends_summary():
    """Return a combined summary of all trend data for the dashboard."""
    top_careers = get_trending_careers(limit=6)
    hot = get_hot_skills()
    risk = get_ai_risk_data()
    companies = get_top_companies(limit=8)
    stats = get_platform_stats()
    sal = get_salary_trends()

    return {
        "top_careers": top_careers["careers"],
        "hot_skills_preview": {
            cat: skills[:3] for cat, skills in hot["skills"].items()
        },
        "highest_risk": [r for r in risk if r["risk_pct"] >= 60][:4],
        "lowest_risk": [r for r in risk if r["risk_pct"] <= 20][:4],
        "top_companies": companies["companies"][:8],
        "platform_stats": stats,
        "salary_trends": sal["trends"],
    }
