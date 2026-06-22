"""
Unit tests for the NLP skill extraction service.

These tests run WITHOUT a server — they test the NLP service module directly.

Run:
    cd backend
    python -m pytest tests/test_nlp.py -v
"""
import sys
import os
import pytest

# Ensure project root is importable
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, os.path.dirname(PROJECT_ROOT))

from backend.services.nlp_service import extract_skills_from_text, get_skill_categories


class TestSkillExtraction:
    """Test the NLP skill extraction pipeline."""

    def test_basic_skill_extraction(self):
        """Common tech skills should be detected."""
        text = "I have 3 years of experience in Python, JavaScript, and React development."
        skills = extract_skills_from_text(text)
        assert "Python" in skills
        assert "JavaScript" in skills
        assert "React" in skills

    def test_empty_text(self):
        """Empty text should return empty list."""
        skills = extract_skills_from_text("")
        assert skills == []

    def test_short_text(self):
        """Very short text should return empty list."""
        skills = extract_skills_from_text("Hi")
        assert skills == []

    def test_no_skills_text(self):
        """Text without tech skills should return empty or minimal list."""
        text = "I enjoy walking in the park and reading books about history."
        skills = extract_skills_from_text(text)
        # Should not detect random words as skills
        assert "walking" not in [s.lower() for s in skills]
        assert "reading" not in [s.lower() for s in skills]

    def test_ambiguous_words_lowercase(self):
        """Ambiguous words in lowercase context should NOT be detected."""
        text = "I have a lot of go, and I react to things quickly. I want to express my feelings."
        skills = extract_skills_from_text(text)
        # "go", "react", "express" in lowercase conversational context → should NOT match
        assert "Go" not in skills or len(skills) == 0

    def test_ambiguous_words_capitalized(self):
        """Ambiguous words when capitalized as tech terms SHOULD be detected."""
        text = "I am a Go developer with experience in React and Express.js."
        skills = extract_skills_from_text(text)
        assert "Go" in skills
        assert "React" in skills

    def test_alias_matching(self):
        """Skill aliases and abbreviations should be normalized."""
        text = "Experienced with ReactJS, Node.js, PostgreSQL, and CI/CD pipelines."
        skills = extract_skills_from_text(text)
        assert "React" in skills
        assert "Node.js" in skills
        assert "PostgreSQL" in skills

    def test_multi_word_skills(self):
        """Multi-word skills should be detected."""
        text = "I specialize in Machine Learning, Natural Language Processing, and Cloud Computing."
        skills = extract_skills_from_text(text)
        assert "Machine Learning" in skills

    def test_deduplication(self):
        """Same skill mentioned multiple times should appear once."""
        text = "Python is my main language. I use Python daily. Python for data science."
        skills = extract_skills_from_text(text)
        assert skills.count("Python") == 1

    def test_result_is_sorted(self):
        """Results should be alphabetically sorted."""
        text = "React, Python, Docker, AWS, MongoDB are my skills."
        skills = extract_skills_from_text(text)
        assert skills == sorted(skills)


class TestSkillCategories:
    """Test skill categorization."""

    def test_categories_structure(self):
        """Categories should return a dict of category → skill list."""
        categories = get_skill_categories(["Python", "React", "Docker"])
        assert isinstance(categories, dict)
        for cat_name, skill_list in categories.items():
            assert isinstance(cat_name, str)
            assert isinstance(skill_list, list)
            for item in skill_list:
                assert "name" in item
                assert "difficulty" in item

    def test_unknown_skill_category(self):
        """Unknown skills should fall into 'Other' category."""
        categories = get_skill_categories(["SomeUnknownTech123"])
        all_skills = []
        for cat_skills in categories.values():
            all_skills.extend([s["name"] for s in cat_skills])
        assert "SomeUnknownTech123" in all_skills


class TestSecurityModule:
    """Test password hashing and JWT tokens."""

    def test_password_hash_and_verify(self):
        """Hashing and verification should work correctly."""
        from backend.core.security import get_password_hash, verify_password

        password = "MySecureP@ss123"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False

    def test_jwt_token_creation(self):
        """JWT token should be created and decodable."""
        from backend.core.security import create_access_token
        from jose import jwt
        from backend.core.config import settings

        token = create_access_token(subject="test@example.com")
        assert isinstance(token, str)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload
