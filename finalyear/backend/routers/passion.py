"""
Passion Career Guide Router
Separate optional feature — does NOT modify existing routes.
Endpoints for exploring passion-based career paths.
"""
from fastapi import APIRouter, Depends, Query
from routers.auth import get_current_user
from services.passion_service import (
    get_all_passions,
    get_categories,
    get_careers_by_passion,
    get_careers_by_category,
    get_passion_roadmap,
    search_passions,
    smart_suggest,
)
import logging

logger = logging.getLogger("PASSION_ROUTER")

router = APIRouter()


@router.get("/passions")
async def list_passions(current_user=Depends(get_current_user)):
    """Get all available passions/hobbies with their categories."""
    passions = get_all_passions()
    categories = get_categories()
    logger.info(f"🎯 Returning {len(passions)} passions for user {current_user['email']}")
    return {
        "passions": passions,
        "categories": categories,
        "total": len(passions),
    }


@router.get("/explore/{passion_name}")
async def explore_passion(
    passion_name: str,
    current_user=Depends(get_current_user),
):
    """Get all career paths for a given passion/hobby."""
    careers = get_careers_by_passion(passion_name)
    logger.info(f"🔍 Found {len(careers)} careers for passion '{passion_name}'")
    return {
        "passion": passion_name,
        "careers": careers,
        "total": len(careers),
    }


@router.get("/category/{category}")
async def explore_category(
    category: str,
    current_user=Depends(get_current_user),
):
    """Get all passion-based careers in a category."""
    careers = get_careers_by_category(category)
    logger.info(f"📂 Found {len(careers)} careers in category '{category}'")
    return {
        "category": category,
        "careers": careers,
        "total": len(careers),
    }


@router.get("/roadmap/{passion_id}")
async def get_roadmap(
    passion_id: str,
    current_user=Depends(get_current_user),
):
    """Get a detailed roadmap for a specific passion career path."""
    roadmap = get_passion_roadmap(passion_id)
    if not roadmap:
        logger.warning(f"⚠️ No roadmap found for passion_id: {passion_id}")
        return {"error": "Passion career not found", "roadmap": None}
    logger.info(f"🗺️ Returning roadmap for '{roadmap['career_title']}' ({passion_id})")
    return {"roadmap": roadmap}


@router.get("/search")
async def search(
    q: str = Query("", description="Search query for passions and careers"),
    current_user=Depends(get_current_user),
):
    """Search passions and career paths by keyword."""
    if not q.strip():
        passions = get_all_passions()
        return {"query": q, "results": [], "passions": passions}

    results = search_passions(q)
    logger.info(f"🔎 Search '{q}' returned {len(results)} results")
    return {
        "query": q,
        "results": results,
        "total": len(results),
    }


@router.post("/suggest")
async def suggest_from_hobbies(
    hobbies: str = Query(..., description="Free-text description of hobbies and interests"),
    current_user=Depends(get_current_user),
):
    """
    Smart Passion-to-Career Suggestion Engine.

    Takes a free-text description of hobbies/interests and maps them
    to career paths using keyword matching.

    Example: "I love photography, editing videos, and playing music"
    → Returns matched passion careers with relevance scores and roadmap info.
    """
    result = smart_suggest(hobbies)
    logger.info(f"🎯 Smart suggest for user {current_user['email']}: "
                f"{result['total_matches']} matches")
    return result
