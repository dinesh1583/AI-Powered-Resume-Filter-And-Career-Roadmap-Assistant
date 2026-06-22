"""
Salary Predictor Router — Endpoints for salary prediction and comparison.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.routers.auth import get_current_user
from backend.services.salary_service import (
    predict_salary, get_career_salary_comparison,
    CAREER_SALARY_BASE, LOCATION_MULTIPLIERS, COMPANY_TIER_MULTIPLIERS
)
import logging

logger = logging.getLogger("SALARY_ROUTER")
router = APIRouter()


class SalaryPredictRequest(BaseModel):
    career: str = Field(..., min_length=2, max_length=100)
    experience_years: float = Field(default=0, ge=0, le=40)
    location: str = Field(default="Bangalore", max_length=50)
    skills: List[str] = Field(default_factory=list)
    company_tier: str = Field(default="Any", max_length=60)
    has_certification: bool = False
    certification_name: str = Field(default="None", max_length=100)


class CompareRequest(BaseModel):
    careers: List[str] = Field(..., min_items=1, max_items=6)


@router.post("/predict")
async def predict(
    request: SalaryPredictRequest,
    current_user=Depends(get_current_user)
):
    """Predict salary range based on career, experience, location, and skills."""
    result = predict_salary(
        career=request.career,
        experience_years=request.experience_years,
        location=request.location,
        skills=request.skills,
        company_tier=request.company_tier,
        has_certification=request.has_certification,
        certification_name=request.certification_name,
    )
    return result


@router.post("/compare")
async def compare_careers(
    request: CompareRequest,
    current_user=Depends(get_current_user)
):
    """Compare salaries across multiple careers."""
    return get_career_salary_comparison(request.careers)


@router.get("/options")
async def get_options():
    """Return available options for the salary predictor form."""
    return {
        "careers": sorted(list(CAREER_SALARY_BASE.keys())),
        "locations": sorted(list(LOCATION_MULTIPLIERS.keys())),
        "company_tiers": list(COMPANY_TIER_MULTIPLIERS.keys()),
        "certifications": [
            "None",
            "AWS Solutions Architect Professional",
            "GCP Professional",
            "CKA (Kubernetes)",
            "Azure Solutions Architect",
            "AWS Developer Associate",
            "Google TensorFlow Developer",
            "PMP",
        ],
    }


@router.get("/quick/{career}")
async def quick_salary(career: str, current_user=Depends(get_current_user)):
    """Quick salary lookup for a career — returns all three tiers."""
    result = get_career_salary_comparison([career])
    return result
