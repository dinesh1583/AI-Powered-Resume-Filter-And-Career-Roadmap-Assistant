"""
Recommendation Service: Course, Video, and Project recommendations.
FIX: Added module-level caching — CSV files now load ONCE instead of per-request.
FIX: Added proper logging throughout.
"""
import csv
import os
import logging
from typing import List, Dict

logger = logging.getLogger("RECOMMENDATION_SERVICE")

# ─── Module-level caches (loaded once) ───
_courses: List[Dict] = []
_videos: List[Dict] = []
_projects: List[Dict] = []
_initialized = False


def _init_recommendation_data():
    """Pre-load all recommendation data at first use."""
    global _courses, _videos, _projects, _initialized
    if _initialized:
        return
    _courses = _load_courses()
    _videos = _load_youtube_videos()
    _projects = _load_projects()
    _initialized = True
    logger.info(f"✅ Recommendation data cached: {len(_courses)} courses, "
                f"{len(_videos)} videos, {len(_projects)} projects")


def _load_courses() -> List[Dict]:
    """Load comprehensive course database."""
    courses_path = os.path.join(os.path.dirname(__file__), "../dataset/courses.csv")
    courses = []
    if os.path.exists(courses_path):
        with open(courses_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                courses.append({
                    "skill": row["skill_name"],
                    "title": row["course_title"],
                    "url": row["course_url"],
                    "type": row["course_type"],
                    "platform": row.get("platform", "Online"),
                    "difficulty": row.get("difficulty", "Intermediate"),
                    "rating": float(row.get("rating", 4.5))
                })
    logger.info(f"✅ Loaded {len(courses)} courses from courses.csv")
    return courses


def _load_youtube_videos() -> List[Dict]:
    """Load YouTube video recommendations from dataset."""
    youtube_path = os.path.join(os.path.dirname(__file__), "../dataset/youtube.csv")
    videos = []
    if os.path.exists(youtube_path):
        with open(youtube_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                videos.append({
                    "skill": row["skill_name"],
                    "title": row["video_title"],
                    "url": row["video_url"],
                    "channel": row.get("channel", "Unknown"),
                    "difficulty": row.get("difficulty", "Intermediate"),
                    "duration_minutes": int(row.get("duration_minutes", 60)),
                })
    logger.info(f"✅ Loaded {len(videos)} YouTube videos from youtube.csv")
    return videos


def _load_projects() -> List[Dict]:
    """Load project ideas database."""
    projects_path = os.path.join(os.path.dirname(__file__), "../dataset/projects.csv")
    projects = []
    if os.path.exists(projects_path):
        with open(projects_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                projects.append({
                    "career": row["career_title"],
                    "title": row["project_title"],
                    "description": row["project_description"],
                    "difficulty": row.get("difficulty", "Intermediate"),
                    "technologies": [t.strip() for t in row.get("technologies", "").split(",")],
                    "github_url": row.get("github_url", "")
                })
    logger.info(f"✅ Loaded {len(projects)} projects from projects.csv")
    return projects


def get_recommendations(user_skills: list, target_career: str, missing_skills: list):
    """
    Generate comprehensive recommendations:
    - Courses for missing skills (prioritized by importance)
    - YouTube videos for quick learning (from youtube.csv)
    - Project ideas for portfolio building

    Uses cached data (loaded once at first call).
    """
    # Ensure data is loaded
    if not _initialized:
        _init_recommendation_data()

    missing_lower = set(s.lower() for s in missing_skills)
    user_lower = set(s.lower() for s in user_skills)

    # --- Courses (from courses.csv, excluding YouTube type) ---
    recommended_courses = []
    for course in _courses:
        skill_lower = course["skill"].lower()
        if course["type"].lower() == "youtube":
            continue  # Skip YouTube entries from courses.csv, we have youtube.csv now

        if skill_lower in missing_lower:
            recommended_courses.append({
                "title": course["title"],
                "type": course["type"],
                "link": course["url"],
                "platform": course["platform"],
                "difficulty": course["difficulty"],
                "rating": course["rating"],
                "skill": course["skill"],
                "priority": "high"
            })
        elif skill_lower in user_lower and course["difficulty"] == "Advanced":
            recommended_courses.append({
                "title": course["title"],
                "type": course["type"],
                "link": course["url"],
                "platform": course["platform"],
                "difficulty": course["difficulty"],
                "rating": course["rating"],
                "skill": course["skill"],
                "priority": "medium"
            })

    # --- YouTube Videos (from youtube.csv) ---
    recommended_videos = []
    for video in _videos:
        skill_lower = video["skill"].lower()
        if skill_lower in missing_lower:
            recommended_videos.append({
                "title": video["title"],
                "type": "YouTube",
                "link": video["url"],
                "platform": "YouTube",
                "channel": video["channel"],
                "difficulty": video["difficulty"],
                "duration_minutes": video["duration_minutes"],
                "skill": video["skill"],
                "priority": "high"
            })
        elif skill_lower in user_lower:
            recommended_videos.append({
                "title": video["title"],
                "type": "YouTube",
                "link": video["url"],
                "platform": "YouTube",
                "channel": video["channel"],
                "difficulty": video["difficulty"],
                "duration_minutes": video["duration_minutes"],
                "skill": video["skill"],
                "priority": "medium"
            })

    # Also include YouTube-type entries from courses.csv as fallback
    for course in _courses:
        if course["type"].lower() == "youtube":
            skill_lower = course["skill"].lower()
            if skill_lower in missing_lower or skill_lower in user_lower:
                recommended_videos.append({
                    "title": course["title"],
                    "type": "YouTube",
                    "link": course["url"],
                    "platform": "YouTube",
                    "channel": course["platform"],
                    "difficulty": course["difficulty"],
                    "duration_minutes": 60,
                    "skill": course["skill"],
                    "priority": "high" if skill_lower in missing_lower else "medium"
                })

    # Deduplicate videos by URL
    seen_urls = set()
    unique_videos = []
    for v in recommended_videos:
        if v["link"] not in seen_urls:
            seen_urls.add(v["link"])
            unique_videos.append(v)
    recommended_videos = unique_videos

    # Sort by priority then rating/duration
    priority_order = {"high": 0, "medium": 1, "low": 2}
    recommended_courses.sort(key=lambda x: (priority_order.get(x["priority"], 2), -x.get("rating", 0)))
    recommended_videos.sort(key=lambda x: (priority_order.get(x["priority"], 2), x.get("duration_minutes", 999)))

    # --- Projects ---
    recommended_projects = []
    for project in _projects:
        if project["career"].lower() == target_career.lower():
            recommended_projects.append(project)

    # If no exact career match, find related ones
    if not recommended_projects:
        for project in _projects:
            if target_career.lower() in project["career"].lower() or project["career"].lower() in target_career.lower():
                recommended_projects.append(project)

    logger.info(f"📚 Recommendations for '{target_career}': "
                f"{len(recommended_courses)} courses, {len(recommended_videos)} videos, "
                f"{len(recommended_projects)} projects")

    return {
        "courses": recommended_courses[:15],
        "videos": recommended_videos[:15],
        "projects": recommended_projects[:5],
        "total_courses": len(recommended_courses),
        "total_videos": len(recommended_videos),
        "total_projects": len(recommended_projects)
    }
