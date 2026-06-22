# 🚀 CareerPulse AI — AI-Powered Career Recommendation System

An intelligent career roadmap platform that uses **Machine Learning** and **NLP** to analyze resumes, extract skills, match careers, and generate personalized learning roadmaps.

**Final Year MCA Project** | FastAPI + React + MongoDB + scikit-learn

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [ML Pipeline](#-ml-pipeline)
- [Setup & Installation](#-setup--installation)
- [Running the Project](#-running-the-project)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Project Structure](#-project-structure)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Resume Analysis** | Upload PDF resume → NLP skill extraction using TF-IDF + spaCy |
| **Career Matching** | Weighted scoring algorithm matches skills to 70+ career paths |
| **Learning Roadmap** | Step-by-step roadmap with resource links and progress tracking |
| **Job Recommendations** | Real Indian job listings (TCS, Infosys, Flipkart, etc.) matched to skills |
| **Course & Video Recs** | Curated courses, YouTube videos, and project ideas for skill gaps |
| **Passion-to-Career** | Explore career paths based on hobbies/interests with roadmaps |
| **JWT Authentication** | Secure login with bcrypt password hashing and token-based auth |
| **Dashboard** | Visual analytics with charts showing career readiness and progress |

---

## 🏗 Architecture

```
┌─────────────┐     HTTP/REST      ┌──────────────────┐     PyMongo     ┌─────────┐
│  React SPA  │ ◄────────────────► │  FastAPI Backend  │ ◄─────────────► │ MongoDB │
│  (Vite)     │                    │                   │                 │ Atlas   │
└─────────────┘                    │  ┌─────────────┐  │                 └─────────┘
                                   │  │ NLP Service  │  │
                                   │  │ (spaCy +     │  │
                                   │  │  TF-IDF .pkl)│  │
                                   │  └─────────────┘  │
                                   └──────────────────┘
```

**Data Flow:**
1. User uploads resume (PDF) → Backend extracts text via `pdfplumber`
2. NLP service runs 3-strategy skill extraction (PhraseMatcher → Regex → TF-IDF cosine similarity)
3. Career service matches skills against weighted career-skill matrix
4. Roadmap service generates personalized step-by-step plan
5. Recommendation service suggests courses, videos, and projects for skill gaps
6. All results persisted to MongoDB and served to frontend

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Framer Motion, Recharts, Lucide Icons |
| **Backend** | FastAPI (Python), Pydantic v2, Uvicorn |
| **Database** | MongoDB Atlas (via PyMongo) |
| **ML/NLP** | scikit-learn (TF-IDF), spaCy (PhraseMatcher), NumPy |
| **Auth** | JWT (python-jose), bcrypt |
| **PDF** | pdfplumber |

---

## 🤖 ML Pipeline

### How It Works

The skill extraction uses a **3-strategy pipeline** with pre-trained models stored as `.pkl` files:

1. **spaCy PhraseMatcher** — Exact phrase matching against 200+ skills from `skills.csv`
2. **Regex Alias Matching** — Catches abbreviations (e.g., "ReactJS" → "React", "k8s" → "Kubernetes")
3. **TF-IDF Cosine Similarity** — Fuzzy ML matching using character n-grams (2-4)

### Training the Models

```bash
cd backend
python -m ml.train_models
```

This generates:
- `tfidf_vectorizer.pkl` — Trained TF-IDF vectorizer
- `skill_vectors.pkl` — Pre-computed skill vector matrix
- `skill_metadata.pkl` — Skill names, categories, lookup sets
- `training_report.json` — Model metrics and validation accuracy

### Career Matching Algorithm

Uses **weighted scoring** where skills have importance levels:
- **Essential** (weight 3.0) — Core skills for the career
- **Important** (weight 2.0) — Expected skills
- **Recommended** (weight 1.0) — Nice-to-have skills

```
Match Score = (Σ matched_skill_weight / Σ total_skill_weight) × 100
```

---

## 📦 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

```bash
# 1. Create virtual environment
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download spaCy model
python -m spacy download en_core_web_sm

# 4. Configure environment
copy .env.example .env
# Edit .env with your MongoDB URL and a secret key

# 5. Train ML models (first time only)
python -m ml.train_models
```

### Frontend Setup

```bash
# From project root
npm install
```

---

## ▶ Running the Project

### Start Backend (Terminal 1)
```bash
cd backend
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (Terminal 2)
```bash
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** https://ai-powered-resume-filter-and-career.onrender.com
- **API Docs:** https://ai-powered-resume-filter-and-career.onrender.com/docs

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login, get JWT token | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update profile | Yes |
| POST | `/user/add-project` | Add project to profile | Yes |
| POST | `/resume/upload` | Upload & analyze resume | Yes |
| GET | `/jobs/` | Get matched Indian jobs | Yes |
| GET | `/recommendations/` | Get courses/videos/projects | Yes |
| POST | `/roadmap/generate` | Generate career roadmap | Yes |
| GET | `/roadmap/{email}` | Get saved roadmap | Yes |
| PUT | `/roadmap/update-step` | Mark step complete | Yes |
| GET | `/passion/passions` | List all passions | Yes |
| GET | `/passion/explore/{name}` | Explore passion careers | Yes |
| GET | `/passion/roadmap/{id}` | Get passion roadmap | Yes |
| GET | `/health` | System health check | No |

---

## 🧪 Testing

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_nlp.py -v

# Run with coverage
python -m pytest tests/ -v --tb=short
```

---

## 📁 Project Structure

```
finalyear/
├── backend/
│   ├── core/
│   │   ├── config.py          # Environment settings (Pydantic)
│   │   └── security.py        # JWT + bcrypt utilities
│   ├── models/
│   │   ├── user_model.py      # Pydantic schemas (User, Education, etc.)
│   │   └── roadmap_model.py   # Roadmap & Step schemas
│   ├── routers/
│   │   ├── auth.py            # Auth endpoints + JWT middleware
│   │   ├── user.py            # Profile CRUD
│   │   ├── resume.py          # Resume upload & analysis pipeline
│   │   ├── roadmap.py         # Roadmap CRUD
│   │   ├── recommendations.py # Course/video/project recs
│   │   ├── jobs.py            # Indian job listings
│   │   └── passion.py         # Passion-to-career module
│   ├── services/
│   │   ├── nlp_service.py     # ML skill extraction (TF-IDF + spaCy)
│   │   ├── career_service.py  # Career matching (weighted scoring)
│   │   ├── recommendation_service.py
│   │   ├── roadmap_service.py
│   │   └── passion_service.py
│   ├── ml/
│   │   ├── train_models.py    # ML training pipeline
│   │   └── trained_models/    # .pkl model files
│   ├── dataset/               # CSV datasets (careers, skills, jobs, etc.)
│   ├── tests/                 # pytest test suite
│   ├── database.py            # MongoDB connection
│   ├── main.py                # FastAPI app entry point
│   └── requirements.txt
├── src/
│   ├── components/            # Navbar, ErrorBoundary, etc.
│   ├── pages/                 # Dashboard, Login, Profile, etc.
│   ├── services/api.js        # Axios API client
│   ├── index.css              # Design system (Deep Space theme)
│   ├── App.jsx                # Routes + AuthContext
│   └── main.jsx               # React entry point
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## 📄 License

This project is developed as a Final Year MCA project for academic purposes.
