"""
Passion Career Guide Service
Separate optional feature: Suggests career roadmaps based on user's passions & hobbies.
Does NOT interfere with existing resume-based career matching pipeline.
"""
import csv
import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger("PASSION_SERVICE")

# ─── Module-level cache (loaded once) ───
_passion_careers: List[Dict] = []
_passion_categories: Dict[str, List[Dict]] = {}
_initialized = False


def init_passion_data():
    """Pre-load passion career data at startup."""
    global _passion_careers, _passion_categories, _initialized
    if _initialized:
        return
    _passion_careers = _load_passion_careers()
    _passion_categories = _build_category_map()
    _initialized = True
    logger.info(f"✅ Loaded {len(_passion_careers)} passion-career mappings across {len(_passion_categories)} categories")


def _load_passion_careers() -> List[Dict]:
    """Load passion-to-career dataset."""
    csv_path = os.path.join(os.path.dirname(__file__), "../dataset/passion_careers.csv")
    careers = []
    if not os.path.exists(csv_path):
        logger.error("❌ passion_careers.csv NOT FOUND")
        return careers

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse roadmap steps
            steps = []
            raw_steps = row.get("roadmap_steps", "")
            for i, step_str in enumerate(raw_steps.split("|"), 1):
                step_str = step_str.strip()
                if not step_str:
                    continue
                # Format: "Step N: Title (duration) — Description"
                parts = step_str.split("—", 1)
                title_part = parts[0].strip()
                description = parts[1].strip() if len(parts) > 1 else ""
                steps.append({
                    "order": i,
                    "title": title_part,
                    "description": description,
                    "is_completed": False,
                })

            # Parse resources
            resources = []
            raw_resources = row.get("resources", "")
            for res in raw_resources.split("|"):
                res = res.strip()
                if res:
                    resources.append(res)

            # Parse key skills
            key_skills = [s.strip() for s in row.get("key_skills", "").split(",") if s.strip()]

            careers.append({
                "id": row["passion_id"],
                "passion": row["passion_name"],
                "category": row["category"],
                "career_title": row["career_title"],
                "career_description": row["career_description"],
                "demand_level": row.get("demand_level", "Medium"),
                "growth_rate": row.get("growth_rate", "N/A"),
                "key_skills": key_skills,
                "roadmap_steps": steps,
                "resources": resources,
            })

    return careers


def _build_category_map() -> Dict[str, List[Dict]]:
    """Group passion careers by category."""
    categories = {}
    for career in _passion_careers:
        cat = career["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(career)
    return categories


def get_all_passions() -> List[Dict]:
    """Get unique list of passions with their categories."""
    if not _initialized:
        init_passion_data()

    seen = {}
    for career in _passion_careers:
        passion = career["passion"]
        if passion not in seen:
            seen[passion] = {
                "name": passion,
                "category": career["category"],
                "career_count": 0,
            }
        seen[passion]["career_count"] += 1

    return sorted(seen.values(), key=lambda x: x["category"])


def get_categories() -> List[str]:
    """Get list of all passion categories."""
    if not _initialized:
        init_passion_data()
    return sorted(_passion_categories.keys())


def get_careers_by_passion(passion_name: str) -> List[Dict]:
    """Get all career options for a specific passion/hobby."""
    if not _initialized:
        init_passion_data()

    results = []
    passion_lower = passion_name.lower()
    for career in _passion_careers:
        if career["passion"].lower() == passion_lower:
            results.append(career)

    if not results:
        # Try partial matching
        for career in _passion_careers:
            if passion_lower in career["passion"].lower() or career["passion"].lower() in passion_lower:
                results.append(career)

    return results


def get_careers_by_category(category: str) -> List[Dict]:
    """Get all passion-based careers in a category."""
    if not _initialized:
        init_passion_data()

    results = []
    category_lower = category.lower()
    for career in _passion_careers:
        if career["category"].lower() == category_lower:
            results.append(career)

    return results


def get_passion_roadmap(passion_id: str) -> Optional[Dict]:
    """Get detailed roadmap for a specific passion career."""
    if not _initialized:
        init_passion_data()

    for career in _passion_careers:
        if career["id"] == passion_id:
            return {
                "passion": career["passion"],
                "career_title": career["career_title"],
                "career_description": career["career_description"],
                "demand_level": career["demand_level"],
                "growth_rate": career["growth_rate"],
                "key_skills": career["key_skills"],
                "steps": career["roadmap_steps"],
                "total_steps": len(career["roadmap_steps"]),
                "resources": career["resources"],
            }

    return None


def search_passions(query: str) -> List[Dict]:
    """Search passions and careers by keyword."""
    if not _initialized:
        init_passion_data()

    query_lower = query.lower()
    results = []
    seen_ids = set()

    for career in _passion_careers:
        if career["id"] in seen_ids:
            continue
        # Search in passion name, category, career title, skills
        searchable = f"{career['passion']} {career['category']} {career['career_title']} {' '.join(career['key_skills'])}".lower()
        if query_lower in searchable:
            results.append(career)
            seen_ids.add(career["id"])

    return results


def smart_suggest(hobbies_text: str) -> Dict:
    """
    Smart Passion-to-Career Suggestion Engine.

    Takes free-text describing user's hobbies/interests and maps them
    to career paths using keyword matching against the passion dataset.

    Input: "I love taking photos, editing videos, and playing guitar"
    Output: Matched passions with career paths and roadmaps

    Algorithm:
      1. Tokenize input into keywords
      2. Match each keyword against passion names, categories, and skills
      3. Score each passion by number of keyword hits
      4. Return top matches with full career details
    """
    if not _initialized:
        init_passion_data()

    if not hobbies_text or len(hobbies_text.strip()) < 3:
        return {"matches": [], "suggestions": [], "query": hobbies_text}

    import re

    # Step 1: Tokenize and clean input
    text_lower = hobbies_text.lower()
    # Extract meaningful words (3+ chars, skip common stop words)
    stop_words = {
        "the", "and", "for", "are", "but", "not", "you", "all", "can",
        "her", "was", "one", "our", "out", "has", "have", "had", "its",
        "how", "who", "what", "when", "where", "why", "this", "that",
        "with", "from", "they", "been", "said", "each", "she", "which",
        "their", "will", "other", "about", "many", "then", "them", "very",
        "like", "love", "enjoy", "interested", "into", "really", "also",
        "want", "would", "could", "should", "just", "doing", "making",
        "some", "more", "much", "things", "stuff", "always", "been",
    }
    words = re.findall(r'[a-z]{3,}', text_lower)
    keywords = [w for w in words if w not in stop_words]

    if not keywords:
        return {"matches": [], "suggestions": [], "query": hobbies_text}

    # Step 2: Score each passion career by keyword hits
    scored = {}
    for career in _passion_careers:
        career_id = career["id"]
        # Build searchable text for this career
        searchable = (
            f"{career['passion']} {career['category']} "
            f"{career['career_title']} {career['career_description']} "
            f"{' '.join(career['key_skills'])}"
        ).lower()

        score = 0
        matched_keywords = []
        for kw in keywords:
            if kw in searchable:
                score += 1
                matched_keywords.append(kw)

        if score > 0:
            if career_id not in scored or scored[career_id]["score"] < score:
                scored[career_id] = {
                    "career": career,
                    "score": score,
                    "matched_keywords": matched_keywords,
                    "relevance": round(score / len(keywords) * 100, 1),
                }

    # Step 3: Sort by score descending, take top results
    ranked = sorted(scored.values(), key=lambda x: x["score"], reverse=True)
    top_matches = ranked[:8]

    # Step 4: Build response
    matches = []
    for item in top_matches:
        career = item["career"]
        matches.append({
            "passion": career["passion"],
            "category": career["category"],
            "career_title": career["career_title"],
            "career_description": career["career_description"],
            "demand_level": career["demand_level"],
            "growth_rate": career["growth_rate"],
            "key_skills": career["key_skills"],
            "roadmap_steps_count": len(career["roadmap_steps"]),
            "passion_id": career["id"],
            "relevance_score": item["relevance"],
            "matched_keywords": item["matched_keywords"],
        })

    # Step 5: Generate suggestions (unique passion names from top results)
    seen_passions = set()
    suggestions = []
    for m in matches:
        if m["passion"] not in seen_passions:
            seen_passions.add(m["passion"])
            suggestions.append(m["passion"])

    logger.info(f"🎯 Smart suggest for '{hobbies_text[:50]}': "
                f"{len(matches)} matches from {len(keywords)} keywords")

    return {
        "query": hobbies_text,
        "keywords_extracted": keywords,
        "matches": matches,
        "suggestions": suggestions[:6],
        "total_matches": len(matches),
    }

