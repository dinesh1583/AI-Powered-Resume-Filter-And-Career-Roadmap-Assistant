"""
Pytest configuration and shared fixtures for the AI Career Roadmap Platform.

Usage:
    cd backend
    python -m pytest tests/ -v
"""
import sys
import os
import pytest

# Ensure the project root is in sys.path so 'backend' package is importable
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


@pytest.fixture(scope="session")
def base_url():
    """Base URL for the running FastAPI server."""
    return os.getenv("TEST_API_URL", "https://ai-powered-resume-filter-and-career.onrender.com")


@pytest.fixture(scope="session")
def test_user():
    """Test user credentials used across integration tests."""
    return {
        "email": "pytest_user@test.com",
        "full_name": "PyTest User",
        "password": "Test@1234"
    }


@pytest.fixture(scope="session")
def auth_token(base_url, test_user):
    """
    Register (if needed) + login, return a valid JWT token.
    Reused across all tests in the session.
    """
    import requests

    # Try registering (ignore if already exists)
    requests.post(f"{base_url}/auth/register", json=test_user)

    # Login
    resp = requests.post(
        f"{base_url}/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]}
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    assert token, "No token received"
    return token


@pytest.fixture(scope="session")
def auth_headers(auth_token):
    """Authorization headers with Bearer token."""
    return {"Authorization": f"Bearer {auth_token}"}
