"""
Creator Economy Service — Data and insights for creator economy careers.
"""
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("CREATOR_SERVICE")


# ─── Creator Niches Data ──────────────────────────────────────────
CREATOR_NICHES = [
    {
        "niche": "Tech Education (YouTube/LinkedIn)",
        "platform": "YouTube & LinkedIn",
        "description": "Teaching programming, system design, or AI concepts.",
        "difficulty": "High",
        "time_to_monetize": "6-12 months",
        "required_skills": ["Coding", "Video Editing", "Public Speaking", "Scripting"],
        "ai_tools": ["ChatGPT (scripts)", "Descript (editing)", "Midjourney (thumbnails)"],
        "followers_to_monetize": "10,000",
        "monthly_income_range": "₹50,000 - ₹5,00,000+",
        "monetization": ["YouTube AdSense", "Course Sales", "Sponsorships", "Affiliate"],
        "icon": "💻",
        "color": "#3b82f6",
        "examples": ["Harkirat Singh", "Akshay Saini", "CodeWithHarry"]
    },
    {
        "niche": "Finance & Crypto (Finfluencer)",
        "platform": "Instagram & YouTube",
        "description": "Explaining stock market, personal finance, or Web3 investing.",
        "difficulty": "Very High",
        "time_to_monetize": "3-8 months",
        "required_skills": ["Financial Literacy", "Short-form Video", "Storytelling", "Research"],
        "ai_tools": ["Claude (research)", "CapCut (reels)", "Canva"],
        "followers_to_monetize": "25,000",
        "monthly_income_range": "₹1,00,000 - ₹10,00,000+",
        "monetization": ["Brand Deals (High CPM)", "Newsletter", "Consulting", "AdSense"],
        "icon": "📈",
        "color": "#10b981",
        "examples": ["Pranjal Kamra", "Sharan Hegde", "Rachana Ranade"]
    },
    {
        "niche": "AI & Automation Tutorials",
        "platform": "Twitter (X) & YouTube",
        "description": "Reviewing AI tools, prompt engineering, and automation workflows.",
        "difficulty": "Medium",
        "time_to_monetize": "2-6 months",
        "required_skills": ["Prompting", "Zapier/Make", "Copywriting", "Trend Spotting"],
        "ai_tools": ["Every AI tool ever"],
        "followers_to_monetize": "5,000",
        "monthly_income_range": "₹40,000 - ₹3,00,000+",
        "monetization": ["SaaS Affiliates", "Consulting", "Advising", "Digital Products"],
        "icon": "🤖",
        "color": "#8b5cf6",
        "examples": ["Various AI niche accounts"]
    },
    {
        "niche": "Career & Resume Advice",
        "platform": "LinkedIn & Instagram",
        "description": "Helping freshers and professionals get jobs and improve resumes.",
        "difficulty": "Medium",
        "time_to_monetize": "4-9 months",
        "required_skills": ["Copywriting", "Networking", "HR Knowledge", "Empathy"],
        "ai_tools": ["ChatGPT (post ideas)", "Taplio (scheduling)"],
        "followers_to_monetize": "15,000",
        "monthly_income_range": "₹30,000 - ₹2,00,000+",
        "monetization": ["Resume Reviews", "1-on-1 Mentorship", "E-books", "Sponsorships"],
        "icon": "👔",
        "color": "#f59e0b",
        "examples": ["Ankur Warikoo (broader)", "Various HR voices"]
    },
    {
        "niche": "Gaming Streamer / Esports",
        "platform": "YouTube Gaming & Rooter",
        "description": "Live streaming games (BGMI, Valorant, GTA V) and entertaining.",
        "difficulty": "Extreme",
        "time_to_monetize": "12-24 months",
        "required_skills": ["High-level Gaming", "Entertaining/Comedy", "OBS Studio", "Community Building"],
        "ai_tools": ["AI Voice Changers", "Automated Clip Generators"],
        "followers_to_monetize": "50,000",
        "monthly_income_range": "₹20,000 - ₹8,00,000+",
        "monetization": ["Superchats", "Sponsorships", "Merch", "AdSense"],
        "icon": "🎮",
        "color": "#ef4444",
        "examples": ["Mortal", "Scout", "Payal Gaming"]
    },
    {
        "niche": "SaaS Builder / Build-in-Public",
        "platform": "Twitter (X) & LinkedIn",
        "description": "Documenting the journey of building a startup or app.",
        "difficulty": "High",
        "time_to_monetize": "Varies",
        "required_skills": ["Coding/No-code", "Marketing", "Transparency", "Storytelling"],
        "ai_tools": ["Cursor (coding)", "V0 (UI)", "ChatGPT"],
        "followers_to_monetize": "2,000",
        "monthly_income_range": "₹10,000 - ₹10,00,000+ (App Revenue)",
        "monetization": ["SaaS Subscriptions", "One-time sales", "Acquisition"],
        "icon": "🚀",
        "color": "#0ea5e9",
        "examples": ["Indie Hackers"]
    }
]


# ─── Income Calculator Base ───────────────────────────────────────
INCOME_BASE = {
    "YouTube": {"rpm": 120, "sponsor_cpm": 300},  # INR per 1000 views
    "Instagram": {"rpm": 0, "sponsor_cpm": 150},
    "LinkedIn": {"rpm": 0, "sponsor_cpm": 400},
    "Twitter": {"rpm": 10, "sponsor_cpm": 100},
}


def get_all_niches() -> List[Dict]:
    """Return all creator niches."""
    return CREATOR_NICHES


def get_niche_details(niche_name: str) -> Optional[Dict]:
    """Get details for a specific niche."""
    for n in CREATOR_NICHES:
        if n["niche"].lower() == niche_name.lower():
            return n
    return None


def calculate_income(platform: str, views_per_month: int, niche_multiplier: float = 1.0) -> Dict[str, Any]:
    """
    Calculate estimated monthly income based on views and platform.
    Niche multiplier: e.g. Finance=2.5x, Tech=1.5x, Gaming=0.7x
    """
    if platform not in INCOME_BASE:
        platform = "YouTube"
        
    rates = INCOME_BASE[platform]
    
    # Calculate Ad Revenue (if applicable)
    ad_revenue = (views_per_month / 1000) * rates["rpm"] * niche_multiplier
    
    # Calculate Sponsorship Revenue (assuming 4 sponsored posts/month at 10% of total views per post)
    sponsor_views = (views_per_month * 0.10) * 4
    sponsor_revenue = (sponsor_views / 1000) * rates["sponsor_cpm"] * niche_multiplier
    
    # Affiliate/Digital Product Revenue (Rule of thumb: equal to ad revenue)
    affiliate_revenue = ad_revenue * 1.5
    
    total_min = int((ad_revenue + sponsor_revenue + affiliate_revenue) * 0.7)
    total_max = int((ad_revenue + sponsor_revenue + affiliate_revenue) * 1.3)
    
    return {
        "platform": platform,
        "views_per_month": views_per_month,
        "estimated_monthly_min_inr": total_min,
        "estimated_monthly_max_inr": total_max,
        "breakdown": {
            "ad_revenue_pct": 20 if rates["rpm"] > 0 else 0,
            "sponsorship_pct": 50,
            "affiliate_products_pct": 30
        }
    }
