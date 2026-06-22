"""
Salary Predictor Service — ML-powered salary prediction for Indian tech market.
Uses a weighted scoring model based on career, skills, experience, and location.
No external APIs required — fully offline computation.
"""
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger("SALARY_SERVICE")


# ─── Salary Base Ranges (INR LPA) ─────────────────────────────────
CAREER_SALARY_BASE = {
    "AI Engineer": {"entry": (8, 14), "mid": (14, 28), "senior": (28, 55)},
    "ML Engineer": {"entry": (7, 13), "mid": (13, 25), "senior": (25, 50)},
    "Data Scientist": {"entry": (6, 12), "mid": (12, 22), "senior": (22, 42)},
    "Data Analyst": {"entry": (3, 7), "mid": (7, 14), "senior": (14, 25)},
    "Full Stack Developer": {"entry": (5, 10), "mid": (10, 20), "senior": (20, 38)},
    "Frontend Developer": {"entry": (4, 8), "mid": (8, 16), "senior": (16, 30)},
    "Backend Developer": {"entry": (5, 10), "mid": (10, 20), "senior": (20, 38)},
    "DevOps Engineer": {"entry": (6, 12), "mid": (12, 25), "senior": (25, 45)},
    "Cloud Engineer": {"entry": (7, 13), "mid": (13, 26), "senior": (26, 48)},
    "Cybersecurity Analyst": {"entry": (5, 10), "mid": (10, 20), "senior": (20, 40)},
    "UI/UX Designer": {"entry": (3, 7), "mid": (7, 15), "senior": (15, 28)},
    "Product Manager": {"entry": (8, 15), "mid": (15, 30), "senior": (30, 60)},
    "Mobile Developer": {"entry": (4, 9), "mid": (9, 18), "senior": (18, 35)},
    "Blockchain Developer": {"entry": (6, 14), "mid": (14, 28), "senior": (28, 55)},
    "Prompt Engineer": {"entry": (6, 12), "mid": (12, 22), "senior": (22, 40)},
    "Software Engineer": {"entry": (4, 9), "mid": (9, 18), "senior": (18, 35)},
    "QA Engineer": {"entry": (3, 6), "mid": (6, 13), "senior": (13, 25)},
    "Embedded Systems Engineer": {"entry": (4, 8), "mid": (8, 16), "senior": (16, 30)},
    "Default": {"entry": (3, 7), "mid": (7, 15), "senior": (15, 30)},
}

# ─── Location Multipliers (relative to Bangalore = 1.0) ──────────
LOCATION_MULTIPLIERS = {
    "Bangalore": 1.0,
    "Mumbai": 0.95,
    "Delhi/NCR": 0.92,
    "Hyderabad": 0.90,
    "Pune": 0.85,
    "Chennai": 0.82,
    "Kolkata": 0.72,
    "Ahmedabad": 0.70,
    "Noida": 0.88,
    "Gurgaon": 0.93,
    "Remote": 0.95,
    "Other": 0.65,
}

# ─── Company Tier Multipliers ─────────────────────────────────────
COMPANY_TIER_MULTIPLIERS = {
    "FAANG/Global MNC": 2.2,
    "Indian Unicorn (Swiggy, Zerodha, etc.)": 1.7,
    "Indian Startup (Series B+)": 1.4,
    "Mid-size Product Company": 1.2,
    "IT Services (TCS, Infosys, etc.)": 0.85,
    "Any": 1.0,
}

# ─── High-Value Skills (salary boosters) ─────────────────────────
SKILL_SALARY_BOOSTS = {
    "Generative AI": 0.35,
    "LangChain": 0.30,
    "RAG": 0.28,
    "MLOps": 0.25,
    "Kubernetes": 0.22,
    "AWS Solutions Architect": 0.22,
    "Terraform": 0.20,
    "PyTorch": 0.20,
    "Blockchain": 0.18,
    "System Design": 0.18,
    "React": 0.12,
    "TypeScript": 0.10,
    "Docker": 0.10,
    "FastAPI": 0.08,
    "GraphQL": 0.08,
    "Next.js": 0.08,
    "PostgreSQL": 0.07,
    "Figma": 0.05,
    "Python": 0.05,
    "SQL": 0.04,
}

# ─── Certification Boosts ─────────────────────────────────────────
CERTIFICATION_BOOSTS = {
    "AWS Solutions Architect Professional": 0.18,
    "GCP Professional": 0.16,
    "CKA (Kubernetes)": 0.15,
    "Azure Solutions Architect": 0.15,
    "AWS Developer Associate": 0.12,
    "Google TensorFlow Developer": 0.10,
    "PMP": 0.10,
    "None": 0.0,
}

# ─── Industry Insights ────────────────────────────────────────────
SALARY_INSIGHTS = {
    "top_insight": "Bangalore-based AI/ML roles at unicorn startups pay 2-3x compared to IT services companies.",
    "negotiation_tip": "Candidates with 2+ GenAI projects negotiate 20-30% above base offer.",
    "market_trend": "Tech salaries in India grew 18% YoY in 2025, with AI roles leading at 35%+.",
    "remote_trend": "Remote roles pay 10-15% less but have 40% less competition, making them easier to land.",
    "freshers_tip": "Freshers with strong GitHub portfolios and 1 deployed project receive 40% more interview calls.",
}


# ─── Core Prediction Function ─────────────────────────────────────

def predict_salary(
    career: str,
    experience_years: float,
    location: str,
    skills: List[str],
    company_tier: str = "Any",
    has_certification: bool = False,
    certification_name: str = "None",
) -> Dict[str, Any]:
    """
    Predict salary range based on multiple weighted factors.

    Returns:
        predicted_min, predicted_max, confidence_band,
        key_factors, comparison_data, tips
    """
    # Step 1: Find base salary range
    base_range = _find_base_range(career)

    # Step 2: Determine experience tier
    exp_tier, exp_multiplier = _get_experience_tier(experience_years)
    base_min, base_max = base_range[exp_tier]

    # Step 3: Apply location multiplier
    loc_mult = LOCATION_MULTIPLIERS.get(location, LOCATION_MULTIPLIERS["Other"])

    # Step 4: Apply company tier multiplier
    tier_mult = COMPANY_TIER_MULTIPLIERS.get(company_tier, 1.0)

    # Step 5: Skills boost (additive percentage)
    skills_lower = [s.lower() for s in skills]
    skill_boost = 0.0
    matched_premium_skills = []
    for skill, boost in SKILL_SALARY_BOOSTS.items():
        if skill.lower() in skills_lower:
            skill_boost += boost
            matched_premium_skills.append({"skill": skill, "boost": f"+{int(boost * 100)}%"})
    skill_boost = min(skill_boost, 0.50)  # Cap at 50%

    # Step 6: Certification boost
    cert_boost = CERTIFICATION_BOOSTS.get(certification_name, 0.0) if has_certification else 0.0

    # Step 7: Total multiplier
    total_mult = loc_mult * tier_mult * (1 + skill_boost + cert_boost)

    predicted_min = round(base_min * total_mult, 1)
    predicted_max = round(base_max * total_mult, 1)

    # Confidence band (± range)
    confidence_min = round(predicted_min * 0.88, 1)
    confidence_max = round(predicted_max * 1.12, 1)

    # Step 8: Build comparison data
    comparison = _build_comparison(career, exp_tier, location)

    # Step 9: Key factors explanation
    key_factors = _build_key_factors(
        career, exp_tier, location, loc_mult, tier_mult,
        skill_boost, cert_boost, matched_premium_skills
    )

    # Step 10: Personalized tips
    tips = _generate_salary_tips(
        predicted_min, predicted_max, exp_tier, matched_premium_skills, skills_lower
    )

    return {
        "predicted_min_lpa": predicted_min,
        "predicted_max_lpa": predicted_max,
        "confidence_min_lpa": confidence_min,
        "confidence_max_lpa": confidence_max,
        "experience_tier": exp_tier,
        "career": career,
        "location": location,
        "company_tier": company_tier,
        "premium_skills_matched": matched_premium_skills[:5],
        "key_factors": key_factors,
        "comparison": comparison,
        "tips": tips,
        "insights": SALARY_INSIGHTS,
        "currency": "INR",
        "unit": "LPA (Lakhs Per Annum)",
    }


def _find_base_range(career: str) -> Dict:
    """Find best matching career salary range."""
    career_lower = career.lower()
    for key, ranges in CAREER_SALARY_BASE.items():
        if key.lower() in career_lower or career_lower in key.lower():
            return ranges
    return CAREER_SALARY_BASE["Default"]


def _get_experience_tier(years: float):
    if years < 2:
        return "entry", 1.0
    elif years < 5:
        return "mid", 1.0
    else:
        return "senior", 1.0


def _build_comparison(career: str, exp_tier: str, location: str) -> List[Dict]:
    """Build salary comparison across locations."""
    base = _find_base_range(career)[exp_tier]
    base_avg = (base[0] + base[1]) / 2
    comparison = []
    for loc, mult in list(LOCATION_MULTIPLIERS.items())[:6]:
        comparison.append({
            "location": loc,
            "avg_lpa": round(base_avg * mult, 1),
            "is_current": loc == location,
        })
    return sorted(comparison, key=lambda x: x["avg_lpa"], reverse=True)


def _build_key_factors(career, exp_tier, location, loc_mult, tier_mult,
                        skill_boost, cert_boost, premium_skills) -> List[Dict]:
    factors = [
        {"factor": "Career Path", "value": career, "impact": "Base", "color": "#7c3aed"},
        {"factor": "Experience Level", "value": exp_tier.title(), "impact": "Neutral", "color": "#06b6d4"},
        {"factor": "Location", "value": location, "impact": f"{'+'if loc_mult>=1 else '-'}{abs(round((loc_mult-1)*100))}%", "color": "#10b981"},
        {"factor": "Company Tier", "value": "", "impact": f"+{round((tier_mult-1)*100)}%" if tier_mult > 1 else "Neutral", "color": "#f59e0b"},
    ]
    if skill_boost > 0:
        factors.append({
            "factor": "Premium Skills",
            "value": f"{len(premium_skills)} matched",
            "impact": f"+{round(skill_boost * 100)}%",
            "color": "#a855f7",
        })
    if cert_boost > 0:
        factors.append({
            "factor": "Certification",
            "value": "Verified",
            "impact": f"+{round(cert_boost * 100)}%",
            "color": "#ec4899",
        })
    return factors


def _generate_salary_tips(pred_min, pred_max, exp_tier, premium_skills, skills_lower) -> List[str]:
    tips = []
    if exp_tier == "entry":
        tips.append("Build 2-3 deployed projects on GitHub to negotiate 20-30% above base offer.")
    if "generative ai" not in skills_lower and "pytorch" not in skills_lower:
        tips.append("Adding GenAI/LLM skills can boost your package by 30-40% in the current market.")
    if not any(s["skill"].lower() in ["kubernetes", "aws solutions architect", "terraform"]
               for s in premium_skills):
        tips.append("Cloud certifications (AWS/GCP) add ₹2-5 LPA to offers at most companies.")
    tips.append("Negotiate joining bonus separately — many Indian companies offer ₹1-3L as a one-time bonus.")
    tips.append("Ask for ESOP/RSU equity at startup/unicorn companies — it can double your total compensation.")
    return tips[:4]


def get_career_salary_comparison(careers: List[str]) -> Dict[str, Any]:
    """Compare salaries across multiple careers for all experience levels."""
    comparison = {}
    for career in careers:
        base = _find_base_range(career)
        comparison[career] = {
            "entry": f"₹{base['entry'][0]}-{base['entry'][1]} LPA",
            "mid": f"₹{base['mid'][0]}-{base['mid'][1]} LPA",
            "senior": f"₹{base['senior'][0]}-{base['senior'][1]} LPA",
        }
    return {"comparison": comparison, "currency": "INR"}
