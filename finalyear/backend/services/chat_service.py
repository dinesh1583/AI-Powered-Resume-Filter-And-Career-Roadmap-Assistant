"""
AI Mentor Chat Service — Intelligent rule-based career Q&A.
Works fully offline without external LLM APIs.
Personalizes responses using the user's analysis data from MongoDB.
"""
import re
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

logger = logging.getLogger("CHAT_SERVICE")

# ─── Knowledge Base ───────────────────────────────────────────────
CAREER_KNOWLEDGE = {
    "salary": {
        "keywords": ["salary", "pay", "lpa", "package", "ctc", "earn", "income", "money"],
        "base": (
            "Salaries in India vary widely by company tier and skills. "
            "Entry-level tech roles pay ₹3–8 LPA, mid-level ₹8–20 LPA, and senior roles ₹20–50+ LPA. "
            "Skills like Generative AI, DevOps, and Cloud Engineering command 30–50% higher packages."
        ),
    },
    "resume": {
        "keywords": ["resume", "cv", "ats", "resume tips", "resume format", "resume score"],
        "base": (
            "A strong resume should: (1) Be 1–2 pages max, (2) Use action verbs like 'Built', 'Led', 'Designed', "
            "(3) Quantify achievements — '50% faster', '10K users', (4) List skills matching the job description, "
            "(5) Include GitHub/portfolio links. ATS systems scan for exact keyword matches, so mirror the job posting's language."
        ),
    },
    "skills": {
        "keywords": ["skills", "learn", "skill", "what should i", "which skills", "technology", "tools"],
        "base": (
            "The most in-demand skills in India 2025–2026: "
            "**Tech:** Python, GenAI/LLMs, React, Node.js, DevOps (Docker+K8s), Cloud (AWS/GCP/Azure). "
            "**Data:** SQL, Pandas, Power BI, Machine Learning. "
            "**Design:** Figma, UI/UX. "
            "**Soft:** Communication, Problem Solving, Agile. "
            "Focus on depth in 2–3 core skills rather than breadth."
        ),
    },
    "interview": {
        "keywords": ["interview", "prepare", "questions", "hr round", "technical round", "dsa", "coding"],
        "base": (
            "Interview preparation strategy: "
            "(1) **DSA** — Practice LeetCode Easy/Medium (50–100 problems), "
            "(2) **System Design** — Learn scalability basics for mid/senior roles, "
            "(3) **Projects** — Be ready to explain every line of your projects, "
            "(4) **HR** — Prepare STAR-format stories for behavioral questions, "
            "(5) **Company Research** — Know the company's product, tech stack, and recent news."
        ),
    },
    "roadmap": {
        "keywords": ["roadmap", "path", "how to become", "plan", "steps", "guide", "journey"],
        "base": (
            "A typical career roadmap has 3 phases: "
            "(1) **Foundation (3–6 months)** — Core language + fundamentals + 1 project, "
            "(2) **Specialization (3–6 months)** — Domain-specific skills + 2–3 portfolio projects, "
            "(3) **Job Ready (1–3 months)** — DSA practice + resume polish + applications. "
            "Use your personalized roadmap on the Roadmap page for specific steps!"
        ),
    },
    "jobs": {
        "keywords": ["jobs", "job market", "hiring", "apply", "openings", "placement", "fresher"],
        "base": (
            "Top Indian companies hiring freshers in 2025: TCS, Infosys, Wipro, Cognizant (mass hiring). "
            "Product companies (Google, Microsoft, Amazon, Razorpay, Zerodha, Jio) pay 3–5x more but are very competitive. "
            "Job platforms: LinkedIn, Naukri, Instahyre, Wellfound (startups), Internshala (internships). "
            "Apply to 20–30 companies simultaneously for best results."
        ),
    },
    "ai": {
        "keywords": ["ai", "machine learning", "ml", "generative ai", "genai", "llm", "chatgpt", "artificial intelligence"],
        "base": (
            "AI/ML is India's fastest-growing career field. Key paths: "
            "(1) **ML Engineer** — Python, scikit-learn, TensorFlow/PyTorch, MLOps, "
            "(2) **Data Scientist** — Statistics, SQL, Pandas, ML, visualization, "
            "(3) **Prompt Engineer** — LLMs, RAG, LangChain, API integration, "
            "(4) **GenAI Developer** — Fine-tuning, Hugging Face, vector databases. "
            "Start with Kaggle competitions and build LLM-powered projects for your portfolio."
        ),
    },
    "creator": {
        "keywords": ["creator", "youtube", "content", "influencer", "instagram", "linkedin creator", "streaming"],
        "base": (
            "The Creator Economy in India is booming! Monthly income potential: "
            "YouTube (Tech niche): ₹50K–5L/month at 100K+ subscribers. "
            "Instagram (niche content): ₹20K–2L/month via brand deals. "
            "LinkedIn (thought leadership): Consulting + premium clients. "
            "Key skills: Video editing (CapCut/Premiere), Thumbnail design (Canva), SEO, and Consistency. "
            "Check the Creator Economy page for detailed breakdowns!"
        ),
    },
    "certification": {
        "keywords": ["certification", "certificate", "course", "google", "aws", "microsoft", "udemy", "coursera"],
        "base": (
            "High-value certifications for India's job market: "
            "**Free:** Google Data Analytics (Coursera), AWS Cloud Practitioner, Microsoft AZ-900. "
            "**Paid (high ROI):** AWS Solutions Architect, GCP Professional, PMP, CFA. "
            "**Indian EdTech:** iNeuron, Scaler, UpGrad, GUVI for structured programs. "
            "Certifications add 10–25% to your resume shortlisting rate."
        ),
    },
    "startup": {
        "keywords": ["startup", "entrepreneurship", "founder", "business", "venture", "product"],
        "base": (
            "Starting a tech startup in India: "
            "(1) Validate with a no-code MVP first (Bubble, Webflow, Glide), "
            "(2) Apply for DPIIT Startup India recognition for tax benefits, "
            "(3) Explore incubators: IIT/IIM incubators, T-Hub, NASSCOM 10K Startups, "
            "(4) Funding: Angel investors, Seed funds, YC India network. "
            "Most successful Indian founders had 2–5 years of work experience first."
        ),
    },
    "default": (
        "Great question! I'm CareerPulse AI Mentor 🤖. I can help with: "
        "career planning, skill recommendations, salary insights, interview prep, "
        "job market trends, and your personalized roadmap. "
        "Try asking: 'What skills should I learn?', 'How do I prepare for interviews?', "
        "or 'What salary can I expect?'"
    ),
}

# ─── Greeting patterns ───
GREETINGS = {"hi", "hello", "hey", "hii", "namaste", "good morning", "good evening", "sup"}

# ─── Personalized response builders ───

def _build_personalized_prefix(user_profile: Optional[Dict]) -> str:
    """Build a personalized greeting using user data."""
    if not user_profile:
        return ""
    name = user_profile.get("full_name", "").split()[0] if user_profile.get("full_name") else ""
    career = user_profile.get("best_career", "")
    score = user_profile.get("match_score", 0)
    parts = []
    if name:
        parts.append(f"Hey {name}!")
    if career and score:
        parts.append(f"Based on your profile ({career}, {score}% match),")
    return " ".join(parts) + " " if parts else ""


def _get_skills_context(user_profile: Optional[Dict], intent: str) -> str:
    """Generate skill-specific context from user's data."""
    if not user_profile:
        return ""
    skills = user_profile.get("skills", [])
    missing = user_profile.get("missing_skills", [])
    career = user_profile.get("best_career", "")

    if intent == "skills" and missing:
        top_missing = missing[:4]
        return (
            f"\n\n💡 **Personalized for you:** Based on your resume, "
            f"the top skills missing for **{career}** are: **{', '.join(top_missing)}**. "
            f"You already have {len(skills)} skills — focus on these gaps to boost your match score significantly."
        )
    if intent == "roadmap" and career:
        return f"\n\n📍 **Your target career:** {career}. Head to the Roadmap page for your step-by-step plan!"
    return ""


def _get_salary_context(user_profile: Optional[Dict]) -> str:
    if not user_profile:
        return ""
    salary = user_profile.get("salary_prediction", {})
    career = user_profile.get("best_career", "")
    if salary and career:
        current = salary.get("current_range", "N/A")
        potential = salary.get("potential_range", "N/A")
        return (
            f"\n\n💰 **Your salary prediction for {career}:** "
            f"Current range: **{current}** | Potential: **{potential}** (INR). "
            f"Visit the Salary Predictor page for a detailed breakdown!"
        )
    return ""


# ─── Main Chat Function ───────────────────────────────────────────

def get_chat_response(user_message: str, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Generate an intelligent, personalized chat response.

    Args:
        user_message: The user's input text
        user_profile: Optional dict with user's analysis data (skills, career, scores)

    Returns:
        Dict with 'response', 'intent', 'suggestions', 'timestamp'
    """
    if not user_message or not user_message.strip():
        return _format_response(CAREER_KNOWLEDGE["default"], "default")

    msg = user_message.strip().lower()

    # ── Greeting handler ──
    if any(msg == g or msg.startswith(g + " ") for g in GREETINGS):
        name = ""
        if user_profile and user_profile.get("full_name"):
            name = f" {user_profile['full_name'].split()[0]}"
        career = user_profile.get("best_career", "") if user_profile else ""
        greeting_resp = (
            f"Hello{name}! 👋 I'm your CareerPulse AI Mentor. "
            f"{'Your top career match is **' + career + '** — ' if career else ''}"
            f"How can I help you today? Ask me about skills, salary, interview prep, or your career roadmap!"
        )
        suggestions = ["What skills should I learn?", "How do I prepare for interviews?", "What salary can I expect?"]
        return _format_response(greeting_resp, "greeting", suggestions)

    # ── Thank you / positive ──
    if any(w in msg for w in ["thank", "thanks", "great", "awesome", "helpful", "nice"]):
        resp = "You're welcome! 😊 Keep pushing towards your career goals. Anything else I can help with?"
        return _format_response(resp, "thanks", ["What should I learn next?", "How to improve my ATS score?"])

    # ── Intent detection ──
    detected_intent = "default"
    best_score = 0

    for intent, data in CAREER_KNOWLEDGE.items():
        if intent == "default":
            continue
        score = sum(1 for kw in data["keywords"] if kw in msg)
        if score > best_score:
            best_score = score
            detected_intent = intent

    # ── Build response ──
    if detected_intent == "default" or best_score == 0:
        response_text = CAREER_KNOWLEDGE["default"]
    else:
        prefix = _build_personalized_prefix(user_profile) if user_profile else ""
        base = CAREER_KNOWLEDGE[detected_intent]["base"]

        # Add personalized context
        context = ""
        if detected_intent == "skills":
            context = _get_skills_context(user_profile, "skills")
        elif detected_intent == "salary":
            context = _get_salary_context(user_profile)
        elif detected_intent == "roadmap":
            context = _get_skills_context(user_profile, "roadmap")

        response_text = prefix + base + context

    suggestions = _get_suggestions(detected_intent)
    return _format_response(response_text, detected_intent, suggestions)


def _get_suggestions(intent: str) -> List[str]:
    """Return contextual follow-up suggestions."""
    suggestion_map = {
        "salary": ["What skills increase salary the most?", "Which companies pay best in India?"],
        "skills": ["How do I build a project portfolio?", "Which certifications are worth it?"],
        "interview": ["What DSA topics should I practice?", "How do I handle HR questions?"],
        "roadmap": ["How long to become job-ready?", "What projects should I build?"],
        "jobs": ["How to apply at product companies?", "Tips for LinkedIn profile?"],
        "ai": ["How to start with Machine Learning?", "What is Prompt Engineering?"],
        "creator": ["How to monetize YouTube?", "Which niche is best for creators?"],
        "certification": ["Which free certifications are best?", "Are Coursera certificates worth it?"],
        "resume": ["How to improve my ATS score?", "What format should I use?"],
        "startup": ["How to get startup funding in India?", "Best no-code tools to start?"],
        "default": ["What skills should I learn?", "How to prepare for interviews?", "What salary can I expect?"],
        "greeting": ["What skills should I learn?", "How do I prepare for interviews?", "What salary can I expect?"],
    }
    return suggestion_map.get(intent, suggestion_map["default"])


def _format_response(text: str, intent: str, suggestions: Optional[List[str]] = None) -> Dict[str, Any]:
    return {
        "response": text,
        "intent": intent,
        "suggestions": suggestions or [],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model": "CareerPulse-Mentor-v1",
    }


# ─── Chat History Management ──────────────────────────────────────

def save_chat_message(db, user_email: str, user_msg: str, bot_response: str, intent: str):
    """Persist chat message to MongoDB."""
    try:
        db.chat_history.insert_one({
            "user_email": user_email,
            "user_message": user_msg,
            "bot_response": bot_response,
            "intent": intent,
            "timestamp": datetime.now(timezone.utc),
        })
    except Exception as e:
        logger.warning(f"Failed to save chat message: {e}")


def get_chat_history(db, user_email: str, limit: int = 20) -> List[Dict]:
    """Retrieve recent chat history for a user."""
    try:
        messages = list(
            db.chat_history.find(
                {"user_email": user_email},
                {"_id": 0}
            ).sort("timestamp", -1).limit(limit)
        )
        # Return in chronological order
        messages.reverse()
        # Convert datetime to ISO string
        for m in messages:
            if isinstance(m.get("timestamp"), datetime):
                m["timestamp"] = m["timestamp"].isoformat()
        return messages
    except Exception as e:
        logger.warning(f"Failed to fetch chat history: {e}")
        return []


def clear_chat_history(db, user_email: str) -> int:
    """Clear all chat history for a user. Returns deleted count."""
    try:
        result = db.chat_history.delete_many({"user_email": user_email})
        return result.deleted_count
    except Exception as e:
        logger.warning(f"Failed to clear chat history: {e}")
        return 0
