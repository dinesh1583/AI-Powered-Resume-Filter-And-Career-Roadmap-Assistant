"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     ML MODEL TRAINING PIPELINE                              ║
║                                                                              ║
║  This script trains the skill extraction models and serializes them          ║
║  as pickle (.pkl) files for production use.                                  ║
║                                                                              ║
║  Models trained:                                                             ║
║    1. TF-IDF Vectorizer (character n-gram) for fuzzy skill matching         ║
║    2. Pre-computed skill vectors (sparse matrix) for cosine similarity      ║
║    3. Skill metadata (names, categories, aliases) as structured data        ║
║                                                                              ║
║  Usage:                                                                      ║
║    cd backend                                                                ║
║    python -m ml.train_models                                                ║
║                                                                              ║
║  Output:                                                                     ║
║    backend/ml/trained_models/tfidf_vectorizer.pkl                           ║
║    backend/ml/trained_models/skill_vectors.pkl                              ║
║    backend/ml/trained_models/skill_metadata.pkl                             ║
║    backend/ml/trained_models/training_report.json                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
import os
import sys
import csv
import json
import pickle
import time
from datetime import datetime, timezone

# ── scikit-learn imports ──
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# ────────────────────────────────────────────────────────────
#  PATHS
# ────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(SCRIPT_DIR, "..", "dataset")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "trained_models")

SKILLS_CSV = os.path.join(DATASET_DIR, "skills.csv")
CAREER_SKILLS_CSV = os.path.join(DATASET_DIR, "career_skills.csv")
CAREERS_CSV = os.path.join(DATASET_DIR, "careers.csv")

# Pickle output paths
TFIDF_PKL = os.path.join(OUTPUT_DIR, "tfidf_vectorizer.pkl")
VECTORS_PKL = os.path.join(OUTPUT_DIR, "skill_vectors.pkl")
METADATA_PKL = os.path.join(OUTPUT_DIR, "skill_metadata.pkl")
REPORT_JSON = os.path.join(OUTPUT_DIR, "training_report.json")


# ────────────────────────────────────────────────────────────
#  STEP 1: Load raw data from CSV
# ────────────────────────────────────────────────────────────
def load_skills():
    """Load skill names, categories, and difficulty from skills.csv."""
    if not os.path.exists(SKILLS_CSV):
        print(f"❌ FATAL: skills.csv not found at {SKILLS_CSV}")
        sys.exit(1)

    skills = []
    with open(SKILLS_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["skill_name"].strip()
            if name:
                skills.append({
                    "name": name,
                    "category": row.get("category", "Other").strip(),
                    "difficulty": row.get("difficulty", "Intermediate").strip(),
                })
    print(f"  ✅ Loaded {len(skills)} skills from skills.csv")
    return skills


def load_career_skills():
    """Load career-to-skill mapping from career_skills.csv."""
    if not os.path.exists(CAREER_SKILLS_CSV):
        print(f"  ⚠️ career_skills.csv not found, skipping career context")
        return {}

    career_skills = {}
    with open(CAREER_SKILLS_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            skill = row["skill_name"].strip()
            career = row["career_id"].strip()
            if skill not in career_skills:
                career_skills[skill] = []
            career_skills[skill].append(career)
    print(f"  ✅ Loaded career-skill mappings for {len(career_skills)} skills")
    return career_skills


# ────────────────────────────────────────────────────────────
#  STEP 2: Build training corpus for TF-IDF
# ────────────────────────────────────────────────────────────

# Contextual expansion — adds related terms to improve TF-IDF recall
SKILL_CONTEXT_MAP = {
    "Python": "python programming language scripting data science backend",
    "JavaScript": "javascript js scripting web frontend backend node",
    "TypeScript": "typescript ts typed javascript superset",
    "Java": "java programming jvm spring enterprise backend",
    "C++": "c++ cpp systems programming low level performance",
    "C#": "csharp c# dotnet microsoft programming",
    "Go": "golang go programming concurrent cloud backend",
    "Rust": "rust programming systems memory safety performance",
    "Ruby": "ruby programming scripting dynamic",
    "PHP": "php programming web backend server scripting",
    "Swift": "swift programming apple ios macos",
    "Kotlin": "kotlin programming android jvm jetbrains",
    "Dart": "dart programming flutter google ui",
    "R": "r programming statistics data analysis",
    "Scala": "scala programming jvm functional spark",
    "HTML": "html markup web structure page",
    "CSS": "css styling web design layout responsive",
    "React": "react reactjs frontend library component jsx",
    "Angular": "angular framework frontend typescript google",
    "Vue.js": "vuejs vue framework frontend progressive",
    "Next.js": "nextjs next react framework ssr static",
    "Node.js": "nodejs node backend server runtime javascript",
    "Express": "express expressjs backend web framework node",
    "Django": "django python web framework backend",
    "Flask": "flask python web microframework backend",
    "FastAPI": "fastapi python web api async backend",
    "MongoDB": "mongodb nosql database document json",
    "PostgreSQL": "postgresql postgres sql relational database",
    "MySQL": "mysql sql relational database",
    "Redis": "redis cache in-memory database key-value",
    "Docker": "docker container virtualization devops deployment",
    "Kubernetes": "kubernetes k8s container orchestration cluster",
    "AWS": "aws amazon web services cloud infrastructure",
    "Azure": "azure microsoft cloud services infrastructure",
    "GCP": "gcp google cloud platform infrastructure",
    "Machine Learning": "ml machine learning algorithm model prediction",
    "Deep Learning": "deep learning neural networks ai model training",
    "TensorFlow": "tensorflow deep learning framework google neural",
    "PyTorch": "pytorch deep learning framework facebook neural",
    "Scikit-Learn": "sklearn scikit learn machine learning classification",
    "Natural Language Processing": "nlp natural language processing text ai",
    "Computer Vision": "computer vision image recognition detection ai",
    "Git": "git version control source code repository",
    "CI/CD": "ci cd continuous integration deployment pipeline",
    "REST APIs": "rest api restful http web services endpoints",
    "SQL": "sql structured query language database relational",
    "Figma": "figma design ui ux prototyping wireframe",
    "UI/UX Design": "ui ux design user interface experience",
    "Cybersecurity": "cybersecurity security hacking defense protection",
    "Agile": "agile methodology scrum kanban sprint iterative",
    "Data Analysis": "data analysis analytics insights visualization",
    "Generative AI": "generative ai llm large language model gpt",
}


def build_training_corpus(skills, career_skills):
    """
    Build a training document for each skill.
    
    Each skill document consists of:
      - The skill name (repeated for emphasis)
      - Lowercase variants and common abbreviations
      - Category context (e.g., "Programming", "Database")
      - Manual contextual expansion (from SKILL_CONTEXT_MAP)
      - Career association context
    
    This corpus is what the TF-IDF vectorizer learns from.
    """
    documents = []
    for skill in skills:
        name = skill["name"]
        category = skill["category"]
        
        # Base: skill name repeated + lowercase
        parts = [name, name.lower(), name.lower()]
        
        # Add category context
        parts.append(category.lower())
        
        # Add manual context expansion if available
        if name in SKILL_CONTEXT_MAP:
            parts.append(SKILL_CONTEXT_MAP[name])
        else:
            # Default: just the lowercase name as context
            parts.append(name.lower())
        
        # Add career context (which careers use this skill)
        career_list = career_skills.get(name, [])
        if career_list:
            parts.append(f"career {' '.join(career_list[:5])}")
        
        doc = " ".join(parts)
        documents.append(doc)
    
    print(f"  ✅ Built training corpus: {len(documents)} documents")
    return documents


# ────────────────────────────────────────────────────────────
#  STEP 3: Train TF-IDF Vectorizer
# ────────────────────────────────────────────────────────────
def train_tfidf(documents):
    """
    Train a TF-IDF Vectorizer on the skill corpus.
    
    Uses character n-grams (2-4) with word boundary awareness 
    for fuzzy matching capability. This means the model can match 
    partial skill names and typos, not just exact strings.
    
    Returns:
        vectorizer: Fitted TfidfVectorizer
        vectors: Sparse matrix of skill vectors (n_skills x n_features)
    """
    print("\n📊 Training TF-IDF Vectorizer...")
    print(f"   Analyzer: char_wb (character n-grams with word boundaries)")
    print(f"   N-gram range: (2, 4)")
    print(f"   Max features: 10000")
    
    vectorizer = TfidfVectorizer(
        analyzer="char_wb",       # Character n-grams respecting word boundaries
        ngram_range=(2, 4),       # 2 to 4 character windows
        max_features=10000,       # Cap vocabulary size
        lowercase=True,           # Normalize to lowercase
        sublinear_tf=True,        # Apply sublinear TF scaling (1 + log(tf))
        strip_accents="unicode",  # Handle accented characters
    )
    
    t0 = time.time()
    vectors = vectorizer.fit_transform(documents)
    elapsed = time.time() - t0
    
    print(f"   ✅ Training complete in {elapsed:.3f}s")
    print(f"   ✅ Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"   ✅ Vector shape: {vectors.shape} (skills × features)")
    print(f"   ✅ Sparse density: {vectors.nnz / (vectors.shape[0] * vectors.shape[1]):.4f}")
    
    return vectorizer, vectors


# ────────────────────────────────────────────────────────────
#  STEP 4: Validate model with test queries
# ────────────────────────────────────────────────────────────
def validate_model(vectorizer, vectors, skills):
    """Run validation tests to ensure the model works correctly."""
    print("\n🧪 Validating model with test queries...")
    
    skill_names = [s["name"] for s in skills]
    
    test_cases = [
        ("python programming machine learning", ["Python", "Machine Learning"]),
        ("react javascript frontend development", ["React", "JavaScript"]),
        ("docker kubernetes cloud deployment", ["Docker", "Kubernetes"]),
        ("sql database mongodb nosql", ["SQL", "MongoDB"]),
        ("tensorflow deep learning neural", ["TensorFlow", "Deep Learning"]),
        ("cybersecurity ethical hacking", ["Cybersecurity", "Ethical Hacking"]),
        ("figma ui ux wireframe", ["Figma", "UI/UX Design"]),
        ("aws cloud infrastructure serverless", ["AWS"]),
    ]
    
    passed = 0
    total = 0
    
    for query, expected_skills in test_cases:
        query_vec = vectorizer.transform([query])
        sims = cosine_similarity(query_vec, vectors).flatten()
        top_5_idx = np.argsort(sims)[-5:][::-1]
        top_5_skills = [skill_names[i] for i in top_5_idx]
        top_5_scores = [sims[i] for i in top_5_idx]
        
        for exp in expected_skills:
            total += 1
            found = exp in top_5_skills
            if found:
                passed += 1
            status = "✅" if found else "❌"
            print(f"   {status} Query: '{query[:40]}...' → Expected '{exp}' → {'FOUND' if found else 'MISSING'} in top 5")
    
    accuracy = (passed / total * 100) if total > 0 else 0
    print(f"\n   📊 Validation: {passed}/{total} passed ({accuracy:.0f}%)")
    return accuracy


# ────────────────────────────────────────────────────────────
#  STEP 5: Save models as pickle files
# ────────────────────────────────────────────────────────────
def save_models(vectorizer, vectors, skills, accuracy):
    """Serialize trained models to pickle files."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"\n💾 Saving models to {OUTPUT_DIR}/")
    
    # 1. Save TF-IDF vectorizer
    with open(TFIDF_PKL, "wb") as f:
        pickle.dump(vectorizer, f, protocol=pickle.HIGHEST_PROTOCOL)
    size_1 = os.path.getsize(TFIDF_PKL) / 1024
    print(f"   ✅ tfidf_vectorizer.pkl ({size_1:.1f} KB)")
    
    # 2. Save pre-computed skill vectors (sparse matrix)
    with open(VECTORS_PKL, "wb") as f:
        pickle.dump(vectors, f, protocol=pickle.HIGHEST_PROTOCOL)
    size_2 = os.path.getsize(VECTORS_PKL) / 1024
    print(f"   ✅ skill_vectors.pkl ({size_2:.1f} KB)")
    
    # 3. Save skill metadata (names, categories, valid set)
    metadata = {
        "skills": skills,                                        # Full skill list with categories
        "skill_names": [s["name"] for s in skills],             # Ordered list of names (matches vector indices)
        "valid_skills_lower": set(s["name"].lower() for s in skills),  # Fast lowercase lookup set
        "category_map": {                                        # skill_name_lower → {category, difficulty}
            s["name"].lower(): {"category": s["category"], "difficulty": s["difficulty"]}
            for s in skills
        },
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "num_skills": len(skills),
        "num_features": vectors.shape[1],
    }
    with open(METADATA_PKL, "wb") as f:
        pickle.dump(metadata, f, protocol=pickle.HIGHEST_PROTOCOL)
    size_3 = os.path.getsize(METADATA_PKL) / 1024
    print(f"   ✅ skill_metadata.pkl ({size_3:.1f} KB)")
    
    # 4. Save a human-readable training report
    report = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "python_version": sys.version,
        "sklearn_version": __import__("sklearn").__version__,
        "numpy_version": np.__version__,
        "dataset": {
            "skills_csv": SKILLS_CSV,
            "num_skills": len(skills),
            "categories": list(set(s["category"] for s in skills)),
        },
        "model": {
            "type": "TfidfVectorizer",
            "analyzer": "char_wb",
            "ngram_range": [2, 4],
            "max_features": 10000,
            "sublinear_tf": True,
            "vocabulary_size": len(vectorizer.vocabulary_),
            "vector_shape": list(vectors.shape),
            "sparse_density": round(vectors.nnz / (vectors.shape[0] * vectors.shape[1]), 6),
        },
        "validation_accuracy": round(accuracy, 1),
        "output_files": {
            "tfidf_vectorizer": f"tfidf_vectorizer.pkl ({size_1:.1f} KB)",
            "skill_vectors": f"skill_vectors.pkl ({size_2:.1f} KB)",
            "skill_metadata": f"skill_metadata.pkl ({size_3:.1f} KB)",
        },
        "total_size_kb": round(size_1 + size_2 + size_3, 1),
    }
    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"   ✅ training_report.json")
    
    print(f"\n   📦 Total model size: {size_1 + size_2 + size_3:.1f} KB")


# ────────────────────────────────────────────────────────────
#  MAIN
# ────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  ML MODEL TRAINING PIPELINE — AI Career Roadmap Platform")
    print("=" * 70)
    print(f"\n🕐 Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Step 1: Load data
    print("📂 Step 1: Loading training data...")
    skills = load_skills()
    career_skills = load_career_skills()
    
    # Step 2: Build corpus
    print("\n📝 Step 2: Building training corpus...")
    documents = build_training_corpus(skills, career_skills)
    
    # Step 3: Train model
    vectorizer, vectors = train_tfidf(documents)
    
    # Step 4: Validate
    accuracy = validate_model(vectorizer, vectors, skills)
    
    # Step 5: Save
    save_models(vectorizer, vectors, skills, accuracy)
    
    print("\n" + "=" * 70)
    print("  ✅ TRAINING COMPLETE — All models saved as pickle files")
    print("=" * 70)
    print(f"\n  The NLP service will load these .pkl files at startup")
    print(f"  instead of re-training from scratch every time.\n")


if __name__ == "__main__":
    main()
