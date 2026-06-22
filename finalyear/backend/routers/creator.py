"""
Creator Economy Router — Endpoints for creator niches and income potential.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.services.creator_service import (
    get_all_niches, get_niche_details, calculate_income
)
import logging

logger = logging.getLogger("CREATOR_ROUTER")
router = APIRouter()

class IncomeRequest(BaseModel):
    platform: str
    views_per_month: int = Field(..., gt=0)
    niche_multiplier: float = 1.0

@router.get("/niches")
async def get_niches():
    """Return all creator niches."""
    return {"niches": get_all_niches()}

@router.get("/explore/{niche}")
async def explore_niche(niche: str):
    """Return details for a specific niche."""
    details = get_niche_details(niche)
    if not details:
        return {"error": "Niche not found", "status": 404}
    return details

@router.post("/calculate-income")
async def calculate_creator_income(request: IncomeRequest):
    """Calculate estimated monthly income based on views and platform."""
    return calculate_income(
        request.platform, 
        request.views_per_month, 
        request.niche_multiplier
    )
