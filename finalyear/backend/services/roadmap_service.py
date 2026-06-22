"""
Roadmap Service: Generate personalized career roadmaps with step tracking.
FIX: Added module-level caching — CSV files now load ONCE instead of per-request.
FIX: Added proper logging throughout.
"""
import csv
import os
import logging
from typing import List, Dict

logger = logging.getLogger("ROADMAP_SERVICE")

# ─── Module-level caches (loaded once) ───
_career_paths: Dict[str, List[Dict]] = {}
_career_projects: Dict[str, List[Dict]] = {}
_initialized = False


def init_roadmap_data():
    """Pre-load roadmap data at startup or first use."""
    global _career_paths, _career_projects, _initialized
    if _initialized:
        return
    _career_paths = _load_career_paths()
    _career_projects = _load_projects()
    _initialized = True
    logger.info(f"✅ Roadmap data cached: {len(_career_paths)} career paths, "
                f"{len(_career_projects)} project sets")


def _load_career_paths() -> Dict[str, List[Dict]]:
    """Load all career roadmap paths with resources."""
    paths_path = os.path.join(os.path.dirname(__file__), "../dataset/career_paths.csv")
    paths = {}
    if os.path.exists(paths_path):
        with open(paths_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                career = row["career_title"]
                if career not in paths:
                    paths[career] = []

                skills = [s.strip() for s in row.get("associated_skills", "").split(",") if s.strip()]

                # Parse resources: format is "title|type|url" separated by ";;"
                resources = []
                raw_resources = row.get("resources", "")
                if raw_resources:
                    for res_str in raw_resources.split(";;"):
                        parts = res_str.strip().split("|")
                        if len(parts) == 3:
                            resources.append({
                                "title": parts[0].strip(),
                                "type": parts[1].strip(),
                                "link": parts[2].strip()
                            })

                paths[career].append({
                    "id": row["step_id"],
                    "order": int(row.get("step_order", len(paths[career]) + 1)),
                    "title": row["step_title"],
                    "description": row["step_description"],
                    "skills": skills,
                    "duration_weeks": int(row.get("duration_weeks", 4)),
                    "resources": resources,
                    "is_completed": False
                })

        # Sort steps by order
        for career in paths:
            paths[career] = sorted(paths[career], key=lambda x: x["order"])

    logger.info(f"✅ Loaded career paths for {len(paths)} careers")
    return paths


def _load_projects() -> Dict[str, List[Dict]]:
    """Load project recommendations from dataset."""
    projects_path = os.path.join(os.path.dirname(__file__), "../dataset/projects.csv")
    projects = {}
    if os.path.exists(projects_path):
        with open(projects_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                career = row["career_title"]
                if career not in projects:
                    projects[career] = []
                projects[career].append({
                    "title": row["project_title"],
                    "description": row["project_description"],
                    "difficulty": row.get("difficulty", "Intermediate"),
                    "technologies": [t.strip() for t in row.get("technologies", "").split(",")],
                    "github_url": row.get("github_url", "")
                })
    logger.info(f"✅ Loaded projects for {len(projects)} careers")
    return projects


def generate_roadmap_steps(target_career: str, user_skills: list, missing_skills: list = None):
    """
    Generate a personalized roadmap with:
    - Auto-completion of steps where user already has skills
    - Resource recommendations per step
    - Duration estimates
    - Missing skills highlighted

    Uses cached data (loaded once at first call).
    """
    # Ensure data is loaded
    if not _initialized:
        init_roadmap_data()

    # Try exact match first, then partial match
    matched_career = None
    for career_name in _career_paths:
        if career_name.lower() == target_career.lower():
            matched_career = career_name
            break

    if not matched_career:
        for career_name in _career_paths:
            if target_career.lower() in career_name.lower() or career_name.lower() in target_career.lower():
                matched_career = career_name
                break

    if matched_career:
        # Deep copy steps to avoid mutating cached data
        import copy
        steps = copy.deepcopy(_career_paths[matched_career])

        user_skills_lower = set(s.lower() for s in user_skills)
        missing_lower = set(s.lower() for s in (missing_skills or []))

        total_weeks = 0
        for step in steps:
            step_skills_lower = [s.lower() for s in step["skills"]]

            # Mark step as completed if user has ALL skills in this step
            if step_skills_lower and all(skill in user_skills_lower for skill in step_skills_lower):
                step["is_completed"] = True

            # Flag which skills in this step are missing
            step["missing_in_step"] = [
                skill for skill in step["skills"]
                if skill.lower() not in user_skills_lower
            ]
            step["acquired_in_step"] = [
                skill for skill in step["skills"]
                if skill.lower() in user_skills_lower
            ]

            if not step["is_completed"]:
                total_weeks += step["duration_weeks"]

        # Add projects for this career
        projects = _career_projects.get(matched_career, [])

        logger.info(f"🗺️ Generated roadmap for '{matched_career}': "
                    f"{len(steps)} steps, {total_weeks} weeks remaining")

        return {
            "career": matched_career,
            "steps": steps,
            "total_duration_weeks": total_weeks,
            "completed_steps": sum(1 for s in steps if s["is_completed"]),
            "total_steps": len(steps),
            "projects": projects
        }

    # No matching career found
    logger.warning(f"⚠️ No roadmap found for career: '{target_career}'")
    return {
        "career": target_career,
        "steps": [],
        "total_duration_weeks": 0,
        "completed_steps": 0,
        "total_steps": 0,
        "projects": []
    }
