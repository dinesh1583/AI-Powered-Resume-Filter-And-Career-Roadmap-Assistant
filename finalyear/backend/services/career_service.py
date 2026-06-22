"""
Career service: Career matching with weighted scoring.
FIX: Added module-level caching — CSV files now load ONCE at startup instead of per-request.
FIX: Added init_career_data() for pre-loading at startup.
"""
import csv
import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger("CAREER_SERVICE")

# ─── Module-level caches (loaded once) ───
_careers: List[Dict] = []
_career_skills_mapping: Dict[str, List[Dict]] = {}
_initialized = False

# Importance weights for scoring
IMPORTANCE_WEIGHTS = {
    "Essential": 3.0,
    "Important": 2.0,
    "Recommended": 1.0
}


def init_career_data():
    """Pre-load career data at startup. Called from main.py lifespan."""
    global _careers, _career_skills_mapping, _initialized
    if _initialized:
        return
    _careers = _load_careers()
    _career_skills_mapping = _load_career_skills()
    _initialized = True


def _load_careers() -> List[Dict]:
    """Load all careers with full metadata."""
    careers_path = os.path.join(os.path.dirname(__file__), "../dataset/careers.csv")
    careers = []
    if os.path.exists(careers_path):
        with open(careers_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                careers.append({
                    "id": row["career_id"],
                    "title": row["career_title"],
                    "description": row["description"],
                    "avg_salary": row.get("avg_salary", "N/A"),
                    "demand_level": row.get("demand_level", "Medium"),
                    "growth_rate": row.get("growth_rate", "N/A")
                })
    logger.info(f"✅ Loaded {len(careers)} careers from careers.csv")
    return careers


def _load_career_skills() -> Dict[str, List[Dict]]:
    """Load career-skill mapping with importance weights."""
    career_skills_path = os.path.join(os.path.dirname(__file__), "../dataset/career_skills.csv")
    mapping = {}
    if os.path.exists(career_skills_path):
        with open(career_skills_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                career_id = row["career_id"]
                if career_id not in mapping:
                    mapping[career_id] = []
                mapping[career_id].append({
                    "skill": row["skill_name"],
                    "importance": row.get("importance", "Important")
                })
    logger.info(f"✅ Loaded career-skill mappings for {len(mapping)} careers")
    return mapping


def match_careers(user_skills: list, top_n: int = 5) -> List[Dict]:
    """
    Match user skills against all careers using weighted scoring.
    Returns top N career matches with gap analysis.
    NO hardcoded fallbacks — returns only real matches.

    Uses cached data (loaded once at startup).
    """
    global _initialized
    if not _initialized:
        init_career_data()

    results = []
    user_skills_lower = set(s.lower() for s in user_skills)
    logger.info(f"🎯 Matching {len(user_skills)} skills against {len(_careers)} careers")

    for career in _careers:
        career_id = career["id"]
        required_skills = _career_skills_mapping.get(career_id, [])
        if not required_skills:
            continue

        # Weighted scoring
        total_weight = 0
        matched_weight = 0
        acquired_skills = []
        missing_skills = []
        missing_essential = []
        missing_important = []
        missing_recommended = []

        for skill_info in required_skills:
            skill_name = skill_info["skill"]
            importance = skill_info["importance"]
            weight = IMPORTANCE_WEIGHTS.get(importance, 1.0)
            total_weight += weight

            if skill_name.lower() in user_skills_lower:
                matched_weight += weight
                acquired_skills.append({
                    "name": skill_name,
                    "importance": importance
                })
            else:
                missing_skills.append(skill_name)
                if importance == "Essential":
                    missing_essential.append(skill_name)
                elif importance == "Important":
                    missing_important.append(skill_name)
                else:
                    missing_recommended.append(skill_name)

        match_score = (matched_weight / total_weight * 100) if total_weight > 0 else 0

        # Only include careers where the user has a meaningful match (> 15%)
        if match_score >= 15.0:
            results.append({
                "title": career["title"],
                "description": career["description"],
                "avg_salary": career["avg_salary"],
                "demand_level": career["demand_level"],
                "growth_rate": career["growth_rate"],
                "match_score": round(match_score, 1),
                "total_skills": len(required_skills),
                "acquired_count": len(acquired_skills),
                "missing_count": len(missing_skills),
                "acquired_skills": [s["name"] for s in acquired_skills],
                "missing_skills": missing_skills,
                "missing_essential": missing_essential,
                "missing_important": missing_important,
                "missing_recommended": missing_recommended,
                "readiness": _calculate_readiness(match_score, len(missing_essential))
            })

    # Sort by match_score descending
    results = sorted(results, key=lambda x: x["match_score"], reverse=True)[:top_n]

    if results:
        logger.info(f"✅ Top matches: {[(r['title'], r['match_score']) for r in results]}")
    else:
        logger.warning(f"⚠️ No career matches found for skills: {user_skills}")

    return results


def _calculate_readiness(match_score: float, missing_essential_count: int) -> str:
    """Calculate career readiness level."""
    if match_score >= 80 and missing_essential_count == 0:
        return "Job Ready"
    elif match_score >= 60:
        return "Almost Ready"
    elif match_score >= 40:
        return "On Track"
    elif match_score >= 20:
        return "Building Foundation"
    else:
        return "Getting Started"


def get_career_by_title(title: str) -> Optional[Dict]:
    """Find a specific career by title."""
    global _initialized
    if not _initialized:
        init_career_data()
    for career in _careers:
        if career["title"].lower() == title.lower():
            return career
    return None
