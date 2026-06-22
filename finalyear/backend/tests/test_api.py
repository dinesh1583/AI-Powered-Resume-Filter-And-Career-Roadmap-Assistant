"""
Integration tests for Auth, User, Jobs, Recommendations, and Roadmap API endpoints.

Prerequisites:
    - Backend server running at https://ai-powered-resume-filter-and-career.onrender.com
    - MongoDB connected

Run:
    cd backend
    python -m pytest tests/test_api.py -v
"""
import pytest
import requests


class TestAuth:
    """Authentication endpoint tests."""

    def test_register_new_user(self, base_url, test_user):
        """Register should succeed or return 400 if already exists."""
        resp = requests.post(f"{base_url}/auth/register", json=test_user)
        assert resp.status_code in (200, 400), f"Unexpected status: {resp.status_code}"
        if resp.status_code == 200:
            data = resp.json()
            assert data["email"] == test_user["email"].lower()
            assert "msg" in data

    def test_register_short_password(self, base_url):
        """Register with short password should fail with 422."""
        resp = requests.post(f"{base_url}/auth/register", json={
            "email": "short@test.com", "full_name": "Short", "password": "ab"
        })
        assert resp.status_code == 422

    def test_login_success(self, base_url, test_user):
        """Login with valid credentials should return a token."""
        resp = requests.post(
            f"{base_url}/auth/login",
            data={"username": test_user["email"], "password": test_user["password"]}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, base_url, test_user):
        """Login with wrong password should return 400."""
        resp = requests.post(
            f"{base_url}/auth/login",
            data={"username": test_user["email"], "password": "wrong_password"}
        )
        assert resp.status_code == 400

    def test_login_nonexistent_user(self, base_url):
        """Login with non-existent email should return 400."""
        resp = requests.post(
            f"{base_url}/auth/login",
            data={"username": "nobody@nowhere.com", "password": "anything"}
        )
        assert resp.status_code == 400

    def test_get_me(self, base_url, auth_headers, test_user):
        """GET /auth/me should return current user without password."""
        resp = requests.get(f"{base_url}/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == test_user["email"].lower()
        assert "hashed_password" not in data

    def test_get_me_no_token(self, base_url):
        """GET /auth/me without token should return 401."""
        resp = requests.get(f"{base_url}/auth/me")
        assert resp.status_code in (401, 403)


class TestUserProfile:
    """User profile endpoint tests."""

    def test_get_profile(self, base_url, auth_headers):
        """GET /user/profile should return profile data."""
        resp = requests.get(f"{base_url}/user/profile", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert "hashed_password" not in data

    def test_update_profile(self, base_url, auth_headers):
        """PUT /user/profile should update user fields."""
        resp = requests.put(f"{base_url}/user/profile", headers=auth_headers, json={
            "about_me": "Test user for automated testing",
            "skills": ["Python", "SQL", "Machine Learning"],
            "education": {"graduation": "B.Tech Computer Science", "status": "completed"},
            "experience": {"level": "Fresher", "years": 0}
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "updated_fields" in data

    def test_add_project(self, base_url, auth_headers):
        """POST /user/add-project should add a project."""
        resp = requests.post(f"{base_url}/user/add-project", headers=auth_headers, json={
            "title": "Test Project",
            "description": "A project for testing",
            "technologies": ["Python", "FastAPI"],
            "link": "https://github.com/test/project"
        })
        assert resp.status_code == 200


class TestJobs:
    """Job listing endpoint tests."""

    def test_get_jobs(self, base_url, auth_headers):
        """GET /jobs/ should return a list of jobs."""
        resp = requests.get(f"{base_url}/jobs/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if data:
            job = data[0]
            assert "title" in job
            assert "company" in job
            assert "match" in job
            assert "location" in job

    def test_get_jobs_filtered(self, base_url, auth_headers):
        """GET /jobs/ with career filter should return filtered results."""
        resp = requests.get(
            f"{base_url}/jobs/?career=Data+Scientist",
            headers=auth_headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    def test_get_jobs_location_filter(self, base_url, auth_headers):
        """GET /jobs/ with location filter should return relevant jobs."""
        resp = requests.get(
            f"{base_url}/jobs/?location=Bangalore",
            headers=auth_headers
        )
        assert resp.status_code == 200
        data = resp.json()
        for job in data:
            assert "bangalore" in job["location"].lower()


class TestRecommendations:
    """Recommendation endpoint tests."""

    def test_get_recommendations(self, base_url, auth_headers):
        """GET /recommendations/ should return courses, videos, and projects."""
        # First ensure user has skills
        requests.put(f"{base_url}/user/profile", headers=auth_headers, json={
            "skills": ["Python", "SQL", "Machine Learning"]
        })

        resp = requests.get(f"{base_url}/recommendations/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "courses" in data
        assert "videos" in data
        assert "projects" in data
        assert "target_career" in data

    def test_recommendations_no_skills(self, base_url):
        """Recommendations with no skills should return 404."""
        # Register a fresh user with no skills
        fresh = {
            "email": "noskills@test.com",
            "full_name": "No Skills",
            "password": "Test@1234"
        }
        requests.post(f"{base_url}/auth/register", json=fresh)
        login_resp = requests.post(
            f"{base_url}/auth/login",
            data={"username": fresh["email"], "password": fresh["password"]}
        )
        if login_resp.status_code == 200:
            headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}
            resp = requests.get(f"{base_url}/recommendations/", headers=headers)
            assert resp.status_code == 404


class TestRoadmap:
    """Roadmap endpoint tests."""

    def test_generate_roadmap(self, base_url, auth_headers):
        """POST /roadmap/generate should create a roadmap."""
        # Ensure skills exist
        requests.put(f"{base_url}/user/profile", headers=auth_headers, json={
            "skills": ["Python", "SQL", "Machine Learning"]
        })

        resp = requests.post(
            f"{base_url}/roadmap/generate?target_career=Data+Scientist",
            headers=auth_headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "target_career" in data
        assert "steps" in data
        assert "total_steps" in data

    def test_get_saved_roadmap(self, base_url, auth_headers, test_user):
        """GET /roadmap/{email} should return the saved roadmap."""
        email = test_user["email"].lower()
        resp = requests.get(
            f"{base_url}/roadmap/{email}",
            headers=auth_headers
        )
        # May be 200 or 404 depending on whether generate was called
        assert resp.status_code in (200, 404)


class TestHealth:
    """Health check endpoint tests."""

    def test_health(self, base_url):
        """GET /health should return system status."""
        resp = requests.get(f"{base_url}/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert "database" in data
        assert "ml_models" in data

    def test_root(self, base_url):
        """GET / should return the frontend HTML."""
        resp = requests.get(f"{base_url}/")
        assert resp.status_code == 200
        assert "text/html" in resp.headers.get("content-type", "")
