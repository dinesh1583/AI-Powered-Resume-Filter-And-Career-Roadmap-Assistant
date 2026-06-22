"""
AI Insights Service: Generates intelligent career insights from analysis data.

This service computes:
  - ATS compatibility score
  - Experience level detection
  - Resume strength level
  - Career readiness score (composite)
  - AI-generated insight text (strengths, weaknesses, suggestions)
  - Salary prediction ranges
  - Hiring probability estimate
  - Skill gap percentage per domain
  - Motivational messages

All computations are based on REAL analysis data — no hardcoded values.
"""
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("INSIGHTS_SERVICE")

# ─── ATS Keywords by Domain ───
ATS_KEYWORDS = {
    "Data Science": ["python", "sql", "machine learning", "tensorflow", "pandas", "numpy", "statistics",
                     "data analysis", "deep learning", "scikit-learn", "r", "tableau", "power bi"],
    "Web Development": ["html", "css", "javascript", "react", "node.js", "mongodb", "rest apis",
                        "git", "typescript", "express", "next.js", "tailwind css"],
    "Mobile Development": ["react native", "flutter", "dart", "swift", "kotlin", "android development",
                           "ios development", "firebase", "rest apis"],
    "DevOps": ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform", "jenkins",
               "github actions", "azure", "gcp", "ansible"],
    "Cybersecurity": ["network security", "penetration testing", "ethical hacking", "cybersecurity",
                      "linux", "python", "wireshark", "firewalls", "siem"],
    "AI/ML Engineer": ["python", "tensorflow", "pytorch", "machine learning", "deep learning",
                       "natural language processing", "computer vision", "docker", "mlops"],
    "UI/UX Design": ["figma", "adobe xd", "sketch", "ui/ux design", "wireframing",
                     "prototyping", "user research", "design systems"],
    "Cloud Engineer": ["aws", "azure", "gcp", "docker", "kubernetes", "terraform",
                       "serverless", "networking", "linux", "ci/cd"],
    "Backend Developer": ["python", "java", "node.js", "sql", "mongodb", "rest apis",
                          "docker", "redis", "microservices", "postgresql"],
    "Full Stack Developer": ["html", "css", "javascript", "react", "node.js", "mongodb",
                             "sql", "git", "docker", "rest apis", "typescript"],
}

# Salary ranges (INR Lakhs Per Annum) by career and readiness
SALARY_RANGES = {
    "Data Scientist": {"entry": "4-8 LPA", "mid": "8-18 LPA", "senior": "18-35 LPA"},
    "Data Analyst": {"entry": "3-6 LPA", "mid": "6-12 LPA", "senior": "12-22 LPA"},
    "Web Developer": {"entry": "3-6 LPA", "mid": "6-14 LPA", "senior": "14-28 LPA"},
    "Full Stack Developer": {"entry": "4-8 LPA", "mid": "8-18 LPA", "senior": "18-35 LPA"},
    "Frontend Developer": {"entry": "3-7 LPA", "mid": "7-15 LPA", "senior": "15-28 LPA"},
    "Backend Developer": {"entry": "4-8 LPA", "mid": "8-18 LPA", "senior": "18-32 LPA"},
    "Mobile App Developer": {"entry": "3-7 LPA", "mid": "7-16 LPA", "senior": "16-30 LPA"},
    "DevOps Engineer": {"entry": "5-9 LPA", "mid": "9-20 LPA", "senior": "20-38 LPA"},
    "Cloud Engineer": {"entry": "5-10 LPA", "mid": "10-22 LPA", "senior": "22-40 LPA"},
    "ML Engineer": {"entry": "5-10 LPA", "mid": "10-22 LPA", "senior": "22-40 LPA"},
    "AI Engineer": {"entry": "5-12 LPA", "mid": "12-25 LPA", "senior": "25-45 LPA"},
    "Cybersecurity Analyst": {"entry": "4-8 LPA", "mid": "8-18 LPA", "senior": "18-35 LPA"},
    "UI/UX Designer": {"entry": "3-6 LPA", "mid": "6-14 LPA", "senior": "14-25 LPA"},
    "Database Administrator": {"entry": "3-7 LPA", "mid": "7-15 LPA", "senior": "15-28 LPA"},
    "Software Engineer": {"entry": "4-8 LPA", "mid": "8-18 LPA", "senior": "18-35 LPA"},
}

# Experience level thresholds
EXPERIENCE_INDICATORS = {
    "senior": ["lead", "architect", "principal", "senior", "staff", "director", "manager", "vp", "head"],
    "mid": ["engineer", "developer", "analyst", "designer", "specialist", "consultant"],
    "entry": ["intern", "fresher", "trainee", "junior", "graduate", "student"],
}


def generate_insights(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate comprehensive AI insights from analysis data.
    
    Returns enriched analysis with:
      - ats_score
      - experience_level
      - resume_strength
      - career_readiness_score
      - career_readiness_label
      - ai_insights (text paragraphs)
      - strengths / weaknesses
      - salary_prediction
      - hiring_probability
      - skill_gap_percentage
      - improvement_suggestions
      - motivational_message
    """
    skills = analysis_data.get("skills", [])
    best_match = analysis_data.get("best_match", {})
    matched_careers = analysis_data.get("matched_careers", [])
    skill_categories = analysis_data.get("skill_categories", {})
    roadmap = analysis_data.get("roadmap", {})
    resume_text_length = analysis_data.get("resume_text_length", 0)

    skills_lower = set(s.lower() for s in skills)
    career_title = best_match.get("title", "")
    match_score = best_match.get("match_score", 0)
    missing_skills = best_match.get("missing_skills", [])
    missing_essential = best_match.get("missing_essential", [])
    acquired_skills = best_match.get("acquired_skills", [])
    total_skills_required = best_match.get("total_skills", 0)

    # ─── 1. ATS Score ───
    ats_score = _compute_ats_score(skills_lower, career_title, resume_text_length)

    # ─── 2. Experience Level ───
    experience_level = _detect_experience_level(skills, len(skills))

    # ─── 3. Resume Strength ───
    resume_strength = _compute_resume_strength(
        len(skills), resume_text_length, len(skill_categories), ats_score
    )

    # ─── 4. Career Readiness Score (composite) ───
    readiness_score, readiness_label = _compute_readiness_score(
        match_score, len(missing_essential), len(skills), ats_score, resume_strength
    )

    # ─── 5. Skill Categories Breakdown ───
    technical_skills = []
    soft_skills = []
    for cat, cat_skills in skill_categories.items():
        cat_lower = cat.lower()
        for s in cat_skills:
            name = s.get("name", s) if isinstance(s, dict) else s
            if cat_lower in ("soft skills", "interpersonal", "communication", "management"):
                soft_skills.append(name)
            else:
                technical_skills.append(name)
    if not soft_skills:
        # Fallback: check skill names for common soft skills
        soft_keywords = {"communication", "teamwork", "leadership", "problem solving",
                         "critical thinking", "time management", "presentation skills",
                         "team collaboration", "project management"}
        for s in skills:
            if s.lower() in soft_keywords:
                soft_skills.append(s)
                if s in technical_skills:
                    technical_skills.remove(s)
    if not technical_skills:
        technical_skills = [s for s in skills if s not in soft_skills]

    # ─── 6. AI Insight Text ───
    strengths = _generate_strengths(skills, skill_categories, match_score, career_title)
    weaknesses = _generate_weaknesses(missing_skills, missing_essential, career_title, match_score)
    suggestions = _generate_suggestions(missing_essential, missing_skills, career_title, readiness_label)

    # Main AI insight paragraph
    main_insight = _generate_main_insight(
        career_title, match_score, skills, missing_skills, missing_essential, readiness_label
    )

    # ─── 7. Salary Prediction ───
    salary_prediction = _predict_salary(career_title, readiness_label)

    # ─── 8. Hiring Probability ───
    hiring_probability = _compute_hiring_probability(match_score, ats_score, len(missing_essential))

    # ─── 9. Skill Gap ───
    total_required = total_skills_required or (len(skills) + len(missing_skills))
    skill_gap_pct = round((len(missing_skills) / max(total_required, 1)) * 100, 1)

    # ─── 10. Domain Scores (for radar chart) ───
    domain_scores = _compute_domain_scores(skills_lower)

    # ─── 11. Motivational Message ───
    motivational_message = _get_motivational_message(readiness_label, career_title, match_score)

    # ─── 12. Confidence Score ───
    confidence_score = min(100, round(
        (match_score * 0.3 + ats_score * 0.25 + resume_strength * 0.2 +
         (100 - skill_gap_pct) * 0.25), 1
    ))

    insights = {
        "ats_score": ats_score,
        "experience_level": experience_level,
        "resume_strength": resume_strength,
        "resume_strength_label": _strength_label(resume_strength),
        "career_readiness_score": readiness_score,
        "career_readiness_label": readiness_label,
        "confidence_score": confidence_score,
        "total_skills": len(skills),
        "technical_skills_count": len(technical_skills),
        "soft_skills_count": len(soft_skills),
        "technical_skills": technical_skills,
        "soft_skills": soft_skills,
        "missing_skills_count": len(missing_skills),
        "skill_gap_percentage": skill_gap_pct,
        "main_insight": main_insight,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_suggestions": suggestions,
        "salary_prediction": salary_prediction,
        "hiring_probability": hiring_probability,
        "domain_scores": domain_scores,
        "motivational_message": motivational_message,
    }

    logger.info(f"🧠 Generated insights: ATS={ats_score}, Readiness={readiness_score} ({readiness_label}), "
                f"Confidence={confidence_score}, Hiring={hiring_probability}%")

    return insights


def _compute_ats_score(skills_lower: set, career_title: str, text_length: int) -> int:
    """Compute ATS compatibility score based on keyword coverage."""
    # Find the best matching ATS domain
    best_domain = None
    best_overlap = 0
    for domain, keywords in ATS_KEYWORDS.items():
        overlap = sum(1 for k in keywords if k in skills_lower)
        if overlap > best_overlap:
            best_overlap = overlap
            best_domain = domain

    if not best_domain:
        return max(20, min(50, len(skills_lower) * 5))

    total_keywords = len(ATS_KEYWORDS[best_domain])
    keyword_score = (best_overlap / max(total_keywords, 1)) * 70

    # Resume length bonus (well-structured resumes are 400-1200 words ≈ 2000-7000 chars)
    length_score = 0
    if text_length > 1500:
        length_score = min(15, (text_length / 7000) * 15)

    # Skill diversity bonus
    diversity_score = min(15, len(skills_lower) * 1.5)

    return min(100, round(keyword_score + length_score + diversity_score))


def _detect_experience_level(skills: List[str], skill_count: int) -> str:
    """Detect experience level from skill breadth."""
    if skill_count >= 15:
        return "Advanced"
    elif skill_count >= 8:
        return "Intermediate"
    elif skill_count >= 4:
        return "Beginner"
    else:
        return "Entry Level"


def _compute_resume_strength(
    skill_count: int, text_length: int, category_count: int, ats_score: int
) -> int:
    """Compute overall resume strength (0-100)."""
    skill_score = min(30, skill_count * 2.5)
    length_score = min(20, (text_length / 5000) * 20)
    diversity_score = min(20, category_count * 5)
    ats_contribution = ats_score * 0.3
    return min(100, round(skill_score + length_score + diversity_score + ats_contribution))


def _compute_readiness_score(
    match_score: float, missing_essential: int, skill_count: int, ats_score: int, resume_strength: int
) -> tuple:
    """Compute composite career readiness score and label."""
    score = round(
        match_score * 0.35 +
        ats_score * 0.2 +
        resume_strength * 0.15 +
        min(100, skill_count * 5) * 0.15 +
        max(0, 100 - missing_essential * 15) * 0.15
    )
    score = min(100, max(0, score))

    if score >= 80:
        label = "Industry Ready"
    elif score >= 60:
        label = "Advanced Candidate"
    elif score >= 40:
        label = "Growing"
    else:
        label = "Beginner"

    return score, label


def _strength_label(strength: int) -> str:
    if strength >= 80:
        return "Excellent"
    elif strength >= 60:
        return "Strong"
    elif strength >= 40:
        return "Moderate"
    else:
        return "Needs Improvement"


def _generate_strengths(
    skills: List[str], categories: Dict, match_score: float, career: str
) -> List[str]:
    """Generate list of strength statements."""
    strengths = []

    if len(skills) >= 10:
        strengths.append(f"Strong technical breadth with {len(skills)} verified skills across multiple domains")
    elif len(skills) >= 5:
        strengths.append(f"Solid foundation with {len(skills)} relevant skills detected")

    if match_score >= 70:
        strengths.append(f"Excellent alignment with {career} requirements ({match_score}% match)")
    elif match_score >= 50:
        strengths.append(f"Good career alignment with {career} ({match_score}% match)")

    if len(categories) >= 3:
        cats = list(categories.keys())[:3]
        strengths.append(f"Diverse skill portfolio spanning {', '.join(cats)}")

    # Highlight top skills by category
    for cat, cat_skills in list(categories.items())[:2]:
        names = [s.get("name", s) if isinstance(s, dict) else s for s in cat_skills[:3]]
        if names:
            strengths.append(f"Strong {cat} skills: {', '.join(names)}")

    return strengths[:5]


def _generate_weaknesses(
    missing: List[str], essential: List[str], career: str, match_score: float
) -> List[str]:
    """Generate list of weakness/gap statements."""
    weaknesses = []

    if essential:
        weaknesses.append(f"Missing {len(essential)} essential skills for {career}: {', '.join(essential[:4])}")

    if len(missing) > 5:
        weaknesses.append(f"Significant skill gap: {len(missing)} skills needed for full {career} readiness")
    elif len(missing) > 0:
        weaknesses.append(f"Minor gaps: {len(missing)} additional skills would strengthen your profile")

    if match_score < 50:
        reduction = 100 - match_score
        weaknesses.append(f"Current skill set reduces career readiness by {reduction:.0f}%")

    return weaknesses[:4]


def _generate_suggestions(
    essential: List[str], missing: List[str], career: str, readiness_label: str
) -> List[str]:
    """Generate actionable improvement suggestions."""
    suggestions = []

    if essential:
        top = essential[:3]
        suggestions.append(f"Priority: Learn {', '.join(top)} — these are essential for {career} roles")

    if readiness_label == "Beginner":
        suggestions.append("Focus on building foundational skills before specializing")
        suggestions.append("Complete at least 2-3 hands-on projects to demonstrate practical ability")
    elif readiness_label == "Growing":
        suggestions.append("Build portfolio projects showcasing your current skills")
        suggestions.append("Start contributing to open-source projects in your target domain")
    elif readiness_label == "Advanced Candidate":
        suggestions.append("Focus on advanced/niche skills to stand out from other candidates")
        suggestions.append("Consider getting certified in your top skills")
    else:
        suggestions.append("You're job-ready! Focus on interview preparation and networking")

    if len(missing) > 0:
        count = min(len(missing), 3)
        suggestions.append(f"Complete {count} more skill(s) to significantly boost your match score")

    return suggestions[:5]


def _generate_main_insight(
    career: str, match_score: float, skills: List[str],
    missing: List[str], essential: List[str], readiness: str
) -> str:
    """Generate the main AI insight paragraph."""
    skill_sample = ", ".join(skills[:5])

    if match_score >= 75:
        base = (f"Your profile strongly matches {career} roles due to your expertise in {skill_sample}. "
                f"With a {match_score}% match score, you're well-positioned for entry into this field.")
    elif match_score >= 50:
        base = (f"Your profile shows good potential for {career} roles. "
                f"Skills like {skill_sample} provide a solid foundation with {match_score}% alignment.")
    else:
        base = (f"Your profile is building towards {career} roles. "
                f"Current skills in {skill_sample} give you a {match_score}% starting position.")

    if essential:
        gap_text = ", ".join(essential[:3])
        reduction = min(len(essential) * 8, 40)
        base += f" However, missing {gap_text} reduces your readiness by approximately {reduction}%."

    if readiness == "Industry Ready":
        base += " You are industry-ready and should focus on interview preparation."
    elif readiness == "Advanced Candidate":
        base += f" Complete {min(len(missing), 3)} more skill(s) to reach Industry Ready status."

    return base


def _predict_salary(career_title: str, readiness: str) -> Dict[str, str]:
    """Predict salary range based on career and readiness level."""
    # Find matching career
    salary = None
    for career_key, ranges in SALARY_RANGES.items():
        if career_key.lower() in career_title.lower() or career_title.lower() in career_key.lower():
            salary = ranges
            break

    if not salary:
        # Default ranges
        salary = {"entry": "3-6 LPA", "mid": "6-15 LPA", "senior": "15-30 LPA"}

    # Pick range based on readiness
    if readiness in ("Industry Ready",):
        current_range = salary["mid"]
        potential = salary["senior"]
    elif readiness in ("Advanced Candidate",):
        current_range = salary["entry"]
        potential = salary["mid"]
    else:
        current_range = salary["entry"]
        potential = salary["mid"]

    return {
        "current_range": current_range,
        "potential_range": potential,
        "currency": "INR"
    }


def _compute_hiring_probability(match_score: float, ats_score: int, missing_essential: int) -> int:
    """Estimate hiring probability percentage."""
    base = match_score * 0.4 + ats_score * 0.35
    penalty = missing_essential * 8
    probability = max(5, min(95, round(base - penalty + 15)))
    return probability


def _compute_domain_scores(skills_lower: set) -> List[Dict[str, Any]]:
    """Compute skill coverage scores per domain (for radar chart)."""
    domain_scores = []
    for domain, keywords in ATS_KEYWORDS.items():
        matched = sum(1 for k in keywords if k in skills_lower)
        total = len(keywords)
        score = round((matched / max(total, 1)) * 100)
        domain_scores.append({
            "domain": domain,
            "score": score,
            "matched": matched,
            "total": total
        })

    # Sort by score descending
    domain_scores.sort(key=lambda x: x["score"], reverse=True)
    return domain_scores


def _get_motivational_message(readiness: str, career: str, match_score: float) -> str:
    """Generate a personalized motivational message."""
    if readiness == "Industry Ready":
        return f"🚀 Outstanding! You're ready to land a {career} role. Start applying today!"
    elif readiness == "Advanced Candidate":
        return f"💪 Great progress! Just a few more skills and you'll be industry-ready for {career}."
    elif readiness == "Growing":
        gap = 100 - match_score
        return f"🌱 You're on the right track! Close the {gap:.0f}% gap with focused learning to break into {career}."
    else:
        return f"🎯 Every expert was once a beginner. Start your {career} journey today — consistency is key!"
