"""
AI Mentor Chat Router — Endpoints for the AI career chatbot.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from routers.auth import get_current_user
from services.chat_service import (
    get_chat_response, save_chat_message,
    get_chat_history, clear_chat_history
)
from database import get_database
import logging

logger = logging.getLogger("CHAT_ROUTER")
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    include_profile_context: bool = True


@router.post("/message")
async def send_message(
    request: ChatRequest,
    current_user=Depends(get_current_user)
):
    """Send a message to the AI mentor and receive a personalized response."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(request.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 chars)")

    # Build user profile context for personalization
    user_profile = None
    if request.include_profile_context:
        db = get_database()
        if db is not None:
            try:
                analysis = db.analyses.find_one(
                    {"user_email": current_user["email"]},
                    sort=[("created_at", -1)]
                )
                if analysis:
                    user_profile = {
                        "full_name": current_user.get("full_name", ""),
                        "skills": analysis.get("skills", []),
                        "best_career": analysis.get("best_match", {}).get("title", ""),
                        "match_score": analysis.get("best_match", {}).get("match_score", 0),
                        "missing_skills": analysis.get("best_match", {}).get("missing_skills", []),
                        "salary_prediction": analysis.get("insights", {}).get("salary_prediction", {}),
                    }
            except Exception as e:
                logger.warning(f"Could not load profile context: {e}")

    # Generate response
    result = get_chat_response(request.message, user_profile)

    # Save to history (non-blocking)
    db = get_database()
    if db is not None:
        save_chat_message(
            db,
            current_user["email"],
            request.message,
            result["response"],
            result["intent"]
        )

    return result


@router.get("/history")
async def get_history(
    limit: int = 20,
    current_user=Depends(get_current_user)
):
    """Retrieve the user's chat history."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    history = get_chat_history(db, current_user["email"], limit=limit)
    return {"history": history, "count": len(history)}


@router.delete("/clear")
async def clear_history(current_user=Depends(get_current_user)):
    """Clear the user's chat history."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    deleted = clear_chat_history(db, current_user["email"])
    return {"message": f"Cleared {deleted} messages", "deleted_count": deleted}


@router.get("/suggestions")
async def get_starter_suggestions(current_user=Depends(get_current_user)):
    """Return starter questions for the chat interface."""
    return {
        "suggestions": [
            "What skills should I learn in 2026?",
            "How do I improve my resume ATS score?",
            "What salary can I expect as a fresher?",
            "How do I prepare for technical interviews?",
            "What are the best certifications to get?",
            "Which companies are hiring freshers in India?",
            "How do I build a portfolio that stands out?",
            "What is the career roadmap for AI Engineer?",
        ]
    }
