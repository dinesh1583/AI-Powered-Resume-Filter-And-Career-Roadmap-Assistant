"""
Industry Trends Service — Real-world Indian tech market data.
Provides trending careers, hot skills, AI replacement risk, and hiring trends.
All data is curated from Indian job market analysis (2024-2026).
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger("TREND_SERVICE")


# ─── Trending Careers Data ────────────────────────────────────────
TRENDING_CAREERS_2026 = [
    {
        "title": "AI/ML Engineer",
        "demand_score": 98,
        "growth_rate": "+42%",
        "avg_salary_lpa": "12-30",
        "ai_replacement_risk": "Low",
        "risk_pct": 8,
        "hiring_trend": "Explosive",
        "top_skills": ["Python", "PyTorch", "LLMs", "MLOps", "Docker"],
        "top_companies": ["Google", "Microsoft", "Juspay", "Sarvam AI", "Krutrim"],
        "remote_availability": "85%",
        "future_scope": "Extremely High",
        "category": "Artificial Intelligence",
        "icon": "🤖",
        "color": "#7c3aed",
        "description": "Design, train, and deploy AI/ML models at scale. The hottest field in India's tech ecosystem.",
        "demand_2024": 85,
        "demand_2025": 95,
        "demand_2026": 98,
        "demand_2030": 100,
    },
    {
        "title": "Full Stack Developer",
        "demand_score": 95,
        "growth_rate": "+28%",
        "avg_salary_lpa": "6-22",
        "ai_replacement_risk": "Medium",
        "risk_pct": 25,
        "hiring_trend": "Very High",
        "top_skills": ["React", "Node.js", "TypeScript", "MongoDB", "Docker"],
        "top_companies": ["Razorpay", "Swiggy", "Zerodha", "Freshworks", "CRED"],
        "remote_availability": "78%",
        "future_scope": "High",
        "category": "Web Development",
        "icon": "💻",
        "color": "#06b6d4",
        "description": "Build end-to-end web applications. Consistently one of the most hired roles in Indian startups.",
        "demand_2024": 80,
        "demand_2025": 90,
        "demand_2026": 95,
        "demand_2030": 88,
    },
    {
        "title": "DevOps / Cloud Engineer",
        "demand_score": 94,
        "growth_rate": "+35%",
        "avg_salary_lpa": "8-25",
        "ai_replacement_risk": "Low",
        "risk_pct": 12,
        "hiring_trend": "Explosive",
        "top_skills": ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
        "top_companies": ["Jio", "HCL", "Wipro", "AWS India", "Capgemini"],
        "remote_availability": "80%",
        "future_scope": "Very High",
        "category": "Cloud & DevOps",
        "icon": "☁️",
        "color": "#f59e0b",
        "description": "Manage cloud infrastructure and deployment pipelines. Critical for every modern tech company.",
        "demand_2024": 75,
        "demand_2025": 88,
        "demand_2026": 94,
        "demand_2030": 96,
    },
    {
        "title": "Data Scientist",
        "demand_score": 92,
        "growth_rate": "+30%",
        "avg_salary_lpa": "8-22",
        "ai_replacement_risk": "Low",
        "risk_pct": 15,
        "hiring_trend": "Very High",
        "top_skills": ["Python", "SQL", "Machine Learning", "Power BI", "Statistics"],
        "top_companies": ["Flipkart", "Meesho", "Paytm", "PhonePe", "Groww"],
        "remote_availability": "72%",
        "future_scope": "Very High",
        "category": "Data & Analytics",
        "icon": "📊",
        "color": "#10b981",
        "description": "Extract insights from data to drive business decisions. High demand across all Indian industries.",
        "demand_2024": 78,
        "demand_2025": 88,
        "demand_2026": 92,
        "demand_2030": 90,
    },
    {
        "title": "Cybersecurity Analyst",
        "demand_score": 91,
        "growth_rate": "+38%",
        "avg_salary_lpa": "6-20",
        "ai_replacement_risk": "Low",
        "risk_pct": 10,
        "hiring_trend": "High",
        "top_skills": ["Network Security", "Python", "Ethical Hacking", "SIEM", "Linux"],
        "top_companies": ["Deloitte", "KPMG", "TCS", "Infosys", "IBM"],
        "remote_availability": "60%",
        "future_scope": "Very High",
        "category": "Security",
        "icon": "🔒",
        "color": "#f43f5e",
        "description": "Protect organizations from cyber threats. Massive shortage of skilled professionals in India.",
        "demand_2024": 70,
        "demand_2025": 82,
        "demand_2026": 91,
        "demand_2030": 98,
    },
    {
        "title": "Prompt Engineer",
        "demand_score": 88,
        "growth_rate": "+120%",
        "avg_salary_lpa": "8-18",
        "ai_replacement_risk": "Low",
        "risk_pct": 5,
        "hiring_trend": "Explosive",
        "top_skills": ["LLM APIs", "Prompt Design", "Python", "RAG", "LangChain"],
        "top_companies": ["OpenAI Partners", "Sarvam AI", "AI startups", "Krutrim", "Ola AI"],
        "remote_availability": "95%",
        "future_scope": "High (evolving)",
        "category": "Artificial Intelligence",
        "icon": "✨",
        "color": "#a855f7",
        "description": "Design effective prompts and AI workflows. The newest and most accessible AI career in 2025.",
        "demand_2024": 30,
        "demand_2025": 65,
        "demand_2026": 88,
        "demand_2030": 75,
    },
    {
        "title": "Product Manager",
        "demand_score": 87,
        "growth_rate": "+25%",
        "avg_salary_lpa": "10-35",
        "ai_replacement_risk": "Low",
        "risk_pct": 18,
        "hiring_trend": "High",
        "top_skills": ["Product Strategy", "Agile", "Data Analysis", "Stakeholder Mgmt", "Figma"],
        "top_companies": ["Zerodha", "CRED", "Nykaa", "Zomato", "Ola"],
        "remote_availability": "55%",
        "future_scope": "Very High",
        "category": "Product & Strategy",
        "icon": "📱",
        "color": "#0ea5e9",
        "description": "Drive product vision and strategy. One of the highest-paying non-engineering roles in Indian startups.",
        "demand_2024": 72,
        "demand_2025": 80,
        "demand_2026": 87,
        "demand_2030": 90,
    },
    {
        "title": "UI/UX Designer",
        "demand_score": 85,
        "growth_rate": "+22%",
        "avg_salary_lpa": "5-16",
        "ai_replacement_risk": "Medium",
        "risk_pct": 30,
        "hiring_trend": "High",
        "top_skills": ["Figma", "User Research", "Prototyping", "Design Systems", "Adobe XD"],
        "top_companies": ["Swiggy", "Dunzo", "Urban Company", "Razorpay", "Meesho"],
        "remote_availability": "75%",
        "future_scope": "High",
        "category": "Design",
        "icon": "🎨",
        "color": "#ec4899",
        "description": "Design intuitive digital experiences. Growing demand as Indian startups prioritize user experience.",
        "demand_2024": 68,
        "demand_2025": 78,
        "demand_2026": 85,
        "demand_2030": 82,
    },
    {
        "title": "Blockchain Developer",
        "demand_score": 78,
        "growth_rate": "+18%",
        "avg_salary_lpa": "8-25",
        "ai_replacement_risk": "Low",
        "risk_pct": 12,
        "hiring_trend": "Growing",
        "top_skills": ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "DeFi"],
        "top_companies": ["WazirX", "CoinDCX", "Polygon", "Mudrex", "Unstoppable Domains India"],
        "remote_availability": "90%",
        "future_scope": "High",
        "category": "Web3 & Blockchain",
        "icon": "⛓️",
        "color": "#64748b",
        "description": "Build decentralized applications and smart contracts on blockchain networks.",
        "demand_2024": 55,
        "demand_2025": 68,
        "demand_2026": 78,
        "demand_2030": 85,
    },
    {
        "title": "No-Code Developer",
        "demand_score": 75,
        "growth_rate": "+65%",
        "avg_salary_lpa": "4-12",
        "ai_replacement_risk": "Medium",
        "risk_pct": 35,
        "hiring_trend": "Fast Growing",
        "top_skills": ["Bubble", "Webflow", "Zapier", "Airtable", "Make"],
        "top_companies": ["Startups", "SMEs", "Agencies", "Freelance clients"],
        "remote_availability": "95%",
        "future_scope": "Medium-High",
        "category": "No-Code & Low-Code",
        "icon": "🔧",
        "color": "#84cc16",
        "description": "Build apps without traditional coding. Fastest growing segment for solopreneurs and small teams.",
        "demand_2024": 40,
        "demand_2025": 60,
        "demand_2026": 75,
        "demand_2030": 70,
    },
]


# ─── Hot Skills by Category ───────────────────────────────────────
HOT_SKILLS_2026 = {
    "AI & Machine Learning": [
        {"skill": "Generative AI / LLMs", "demand": 99, "growth": "+180%", "avg_salary_boost": "+40%"},
        {"skill": "LangChain / RAG", "demand": 94, "growth": "+250%", "avg_salary_boost": "+35%"},
        {"skill": "PyTorch", "demand": 91, "growth": "+55%", "avg_salary_boost": "+30%"},
        {"skill": "MLOps / Model Deployment", "demand": 89, "growth": "+80%", "avg_salary_boost": "+25%"},
        {"skill": "Computer Vision", "demand": 85, "growth": "+45%", "avg_salary_boost": "+28%"},
    ],
    "Cloud & DevOps": [
        {"skill": "Kubernetes (K8s)", "demand": 95, "growth": "+60%", "avg_salary_boost": "+35%"},
        {"skill": "AWS (Solutions Architect)", "demand": 93, "growth": "+40%", "avg_salary_boost": "+30%"},
        {"skill": "Terraform / IaC", "demand": 90, "growth": "+70%", "avg_salary_boost": "+28%"},
        {"skill": "GitHub Actions / CI-CD", "demand": 88, "growth": "+50%", "avg_salary_boost": "+20%"},
        {"skill": "Docker", "demand": 92, "growth": "+35%", "avg_salary_boost": "+20%"},
    ],
    "Web Development": [
        {"skill": "React.js + TypeScript", "demand": 96, "growth": "+30%", "avg_salary_boost": "+20%"},
        {"skill": "Next.js", "demand": 91, "growth": "+55%", "avg_salary_boost": "+22%"},
        {"skill": "GraphQL", "demand": 80, "growth": "+35%", "avg_salary_boost": "+18%"},
        {"skill": "WebAssembly", "demand": 65, "growth": "+90%", "avg_salary_boost": "+25%"},
        {"skill": "Edge Computing / CDN", "demand": 72, "growth": "+45%", "avg_salary_boost": "+20%"},
    ],
    "Data & Analytics": [
        {"skill": "SQL (Advanced)", "demand": 97, "growth": "+15%", "avg_salary_boost": "+15%"},
        {"skill": "Power BI / Tableau", "demand": 88, "growth": "+40%", "avg_salary_boost": "+18%"},
        {"skill": "Apache Spark", "demand": 82, "growth": "+35%", "avg_salary_boost": "+25%"},
        {"skill": "dbt (Data Build Tool)", "demand": 75, "growth": "+120%", "avg_salary_boost": "+20%"},
        {"skill": "Vector Databases", "demand": 78, "growth": "+300%", "avg_salary_boost": "+30%"},
    ],
    "Security": [
        {"skill": "Cloud Security (AWS/GCP)", "demand": 91, "growth": "+70%", "avg_salary_boost": "+30%"},
        {"skill": "Zero Trust Architecture", "demand": 85, "growth": "+90%", "avg_salary_boost": "+28%"},
        {"skill": "VAPT / Penetration Testing", "demand": 88, "growth": "+55%", "avg_salary_boost": "+25%"},
        {"skill": "SIEM / SOC Analysis", "demand": 83, "growth": "+60%", "avg_salary_boost": "+22%"},
    ],
}


# ─── AI Replacement Risk Data ─────────────────────────────────────
AI_RISK_DATA = [
    {"career": "Data Entry Operator", "risk_pct": 95, "risk_level": "Critical", "timeframe": "2025-2027"},
    {"career": "Basic QA Tester", "risk_pct": 75, "risk_level": "High", "timeframe": "2026-2028"},
    {"career": "Junior Copywriter", "risk_pct": 70, "risk_level": "High", "timeframe": "2025-2027"},
    {"career": "Basic Web Designer", "risk_pct": 60, "risk_level": "Medium", "timeframe": "2026-2029"},
    {"career": "Junior Data Analyst", "risk_pct": 45, "risk_level": "Medium", "timeframe": "2027-2030"},
    {"career": "No-Code Developer", "risk_pct": 35, "risk_level": "Low-Medium", "timeframe": "2028-2031"},
    {"career": "UI/UX Designer", "risk_pct": 30, "risk_level": "Low-Medium", "timeframe": "2028-2032"},
    {"career": "Full Stack Developer", "risk_pct": 25, "risk_level": "Low", "timeframe": "2030+"},
    {"career": "Product Manager", "risk_pct": 18, "risk_level": "Low", "timeframe": "2030+"},
    {"career": "Cybersecurity Analyst", "risk_pct": 10, "risk_level": "Very Low", "timeframe": "2035+"},
    {"career": "AI/ML Engineer", "risk_pct": 8, "risk_level": "Very Low", "timeframe": "2035+"},
    {"career": "Prompt Engineer", "risk_pct": 5, "risk_level": "Minimal", "timeframe": "2040+"},
]


# ─── Salary Trend Data ────────────────────────────────────────────
SALARY_TRENDS = {
    "AI Engineer": {"2022": 10, "2023": 14, "2024": 20, "2025": 28, "2026": 35},
    "DevOps Engineer": {"2022": 8, "2023": 11, "2024": 15, "2025": 20, "2026": 25},
    "Full Stack Developer": {"2022": 6, "2023": 9, "2024": 12, "2025": 16, "2026": 20},
    "Data Scientist": {"2022": 7, "2023": 10, "2024": 14, "2025": 18, "2026": 22},
    "Cybersecurity Analyst": {"2022": 5, "2023": 8, "2024": 12, "2025": 16, "2026": 20},
    "UI/UX Designer": {"2022": 4, "2023": 6, "2024": 8, "2025": 11, "2026": 14},
}


# ─── Indian Companies Hiring Data ────────────────────────────────
TOP_HIRING_COMPANIES = [
    {"company": "Jio Platforms", "openings": 5000, "focus": "AI, 5G, Cloud", "avg_salary_lpa": "8-18", "tier": "T1"},
    {"company": "TCS", "openings": 40000, "focus": "Cloud, AI, Enterprise", "avg_salary_lpa": "3-12", "tier": "Mass"},
    {"company": "Infosys", "openings": 25000, "focus": "Digital, Cloud, AI", "avg_salary_lpa": "3-15", "tier": "Mass"},
    {"company": "Razorpay", "openings": 800, "focus": "Fintech, Full Stack, Data", "avg_salary_lpa": "12-35", "tier": "Startup"},
    {"company": "Zerodha", "openings": 200, "focus": "Fintech, Python, Trading", "avg_salary_lpa": "10-30", "tier": "Product"},
    {"company": "Swiggy", "openings": 1500, "focus": "ML, Backend, DevOps", "avg_salary_lpa": "12-40", "tier": "Unicorn"},
    {"company": "Zomato", "openings": 1200, "focus": "Full Stack, ML, Growth", "avg_salary_lpa": "10-35", "tier": "Unicorn"},
    {"company": "PhonePe", "openings": 1000, "focus": "Payments, Backend, AI", "avg_salary_lpa": "12-40", "tier": "Unicorn"},
    {"company": "Freshworks", "openings": 600, "focus": "SaaS, AI, Full Stack", "avg_salary_lpa": "10-30", "tier": "Product"},
    {"company": "Zoho", "openings": 3000, "focus": "Full Stack, Mobile, AI", "avg_salary_lpa": "5-18", "tier": "Product"},
    {"company": "CRED", "openings": 400, "focus": "Fintech, Data, Design", "avg_salary_lpa": "15-45", "tier": "Unicorn"},
    {"company": "Groww", "openings": 500, "focus": "Fintech, ML, Backend", "avg_salary_lpa": "12-38", "tier": "Unicorn"},
    {"company": "Meesho", "openings": 800, "focus": "E-commerce, ML, Data", "avg_salary_lpa": "10-32", "tier": "Unicorn"},
    {"company": "Byju's (THINK & LEARN)", "openings": 2000, "focus": "EdTech, AI, Content", "avg_salary_lpa": "4-15", "tier": "Unicorn"},
    {"company": "Unacademy", "openings": 600, "focus": "EdTech, Video, ML", "avg_salary_lpa": "5-18", "tier": "Startup"},
]


# ─── Platform Statistics ──────────────────────────────────────────
PLATFORM_STATS = {
    "total_jobs_indexed": 125000,
    "active_companies": 850,
    "careers_tracked": 31,
    "skills_in_database": 500,
    "avg_resume_score": 68,
    "users_placed": 2400,
    "avg_salary_increase_pct": 32,
    "states_covered": 22,
}


# ─── Service Functions ────────────────────────────────────────────

def get_trending_careers(limit: int = 10, category: str = None) -> Dict[str, Any]:
    """Return top trending careers, optionally filtered by category."""
    careers = TRENDING_CAREERS_2026
    if category:
        careers = [c for c in careers if c["category"].lower() == category.lower()]
    careers = sorted(careers, key=lambda x: x["demand_score"], reverse=True)
    return {
        "careers": careers[:limit],
        "total": len(careers),
        "categories": list({c["category"] for c in TRENDING_CAREERS_2026}),
        "last_updated": "May 2026",
    }


def get_hot_skills(category: str = None) -> Dict[str, Any]:
    """Return hot skills — optionally filtered by category."""
    if category and category in HOT_SKILLS_2026:
        return {"skills": {category: HOT_SKILLS_2026[category]}}
    return {"skills": HOT_SKILLS_2026, "categories": list(HOT_SKILLS_2026.keys())}


def get_ai_risk_data() -> List[Dict]:
    """Return AI replacement risk data sorted by risk level."""
    return sorted(AI_RISK_DATA, key=lambda x: x["risk_pct"], reverse=True)


def get_salary_trends(careers: List[str] = None) -> Dict[str, Any]:
    """Return salary trend data for specified careers or all."""
    if careers:
        filtered = {k: v for k, v in SALARY_TRENDS.items()
                    if any(c.lower() in k.lower() for c in careers)}
        return {"trends": filtered or SALARY_TRENDS}
    return {"trends": SALARY_TRENDS, "unit": "LPA (Lakhs Per Annum)", "years": list(SALARY_TRENDS["AI Engineer"].keys())}


def get_top_companies(tier: str = None, limit: int = 15) -> Dict[str, Any]:
    """Return top hiring companies filtered by tier."""
    companies = TOP_HIRING_COMPANIES
    if tier:
        companies = [c for c in companies if c["tier"].lower() == tier.lower()]
    return {"companies": companies[:limit], "total": len(companies)}


def get_platform_stats() -> Dict[str, Any]:
    return PLATFORM_STATS
