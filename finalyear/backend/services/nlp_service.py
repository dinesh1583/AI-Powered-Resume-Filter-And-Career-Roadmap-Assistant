"""
NLP Service: ML-powered skill extraction from resume text.

Architecture:
  1. Loads PRE-TRAINED models from pickle files (backend/ml/trained_models/)
     - tfidf_vectorizer.pkl  → Trained TF-IDF character n-gram vectorizer
     - skill_vectors.pkl     → Pre-computed skill vector matrix
     - skill_metadata.pkl    → Skill names, categories, lookup sets
  2. spaCy PhraseMatcher for exact phrase matching
  3. Regex patterns for aliases/abbreviations
  4. TF-IDF cosine similarity for fuzzy/ML-based matching

Run `python -m ml.train_models` (from backend/) to re-train and regenerate pickle files.
"""
import csv
import os
import re
import pickle
import logging
from typing import List, Set, Dict

logger = logging.getLogger("NLP_SERVICE")

# ─── Paths to pickle files ───
_ML_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "trained_models")
_TFIDF_PKL = os.path.join(_ML_DIR, "tfidf_vectorizer.pkl")
_VECTORS_PKL = os.path.join(_ML_DIR, "skill_vectors.pkl")
_METADATA_PKL = os.path.join(_ML_DIR, "skill_metadata.pkl")

# ─── Globals (loaded once at startup via init_nlp()) ───
_nlp = None
_matcher = None
_skills_list: List[str] = []
_valid_skills: Set[str] = set()
_tfidf_vectorizer = None
_skill_vectors = None
_category_map: Dict = {}
_initialized = False


def init_nlp():
    """
    Initialize the NLP pipeline — called once at app startup.
    
    Loads:
      - Pre-trained TF-IDF vectorizer from pickle (NO re-training)
      - Pre-computed skill vectors from pickle
      - Skill metadata (names, categories) from pickle
      - spaCy model for PhraseMatcher
    """
    global _nlp, _matcher, _skills_list, _valid_skills
    global _tfidf_vectorizer, _skill_vectors, _category_map, _initialized

    if _initialized:
        return

    # ── Step 1: Load spaCy model ──
    import spacy
    from spacy.matcher import PhraseMatcher
    try:
        _nlp = spacy.load("en_core_web_sm")
        logger.info("✅ spaCy model 'en_core_web_sm' loaded")
    except OSError:
        _nlp = spacy.blank("en")
        logger.warning("⚠️ spaCy model not found, using blank. Run: python -m spacy download en_core_web_sm")

    # ── Step 2: Load pre-trained models from PICKLE FILES ──
    pickle_loaded = False

    if os.path.exists(_TFIDF_PKL) and os.path.exists(_VECTORS_PKL) and os.path.exists(_METADATA_PKL):
        try:
            # Load TF-IDF vectorizer (trained by ml/train_models.py)
            with open(_TFIDF_PKL, "rb") as f:
                _tfidf_vectorizer = pickle.load(f)
            pkl_size = os.path.getsize(_TFIDF_PKL) / 1024
            logger.info(f"✅ Loaded tfidf_vectorizer.pkl ({pkl_size:.1f} KB)")

            # Load pre-computed skill vectors
            with open(_VECTORS_PKL, "rb") as f:
                _skill_vectors = pickle.load(f)
            pkl_size = os.path.getsize(_VECTORS_PKL) / 1024
            logger.info(f"✅ Loaded skill_vectors.pkl ({pkl_size:.1f} KB) → shape {_skill_vectors.shape}")

            # Load skill metadata
            with open(_METADATA_PKL, "rb") as f:
                metadata = pickle.load(f)
            pkl_size = os.path.getsize(_METADATA_PKL) / 1024
            logger.info(f"✅ Loaded skill_metadata.pkl ({pkl_size:.1f} KB)")

            _skills_list = metadata["skill_names"]
            _valid_skills = metadata["valid_skills_lower"]
            _category_map = metadata["category_map"]

            trained_at = metadata.get("trained_at", "unknown")
            logger.info(f"✅ Model metadata: {metadata['num_skills']} skills, "
                        f"{metadata['num_features']} features, trained at {trained_at}")

            pickle_loaded = True

        except Exception as e:
            logger.error(f"❌ Failed to load pickle files: {e}")
            logger.warning("⚠️ Falling back to CSV + runtime training")
    else:
        logger.warning(f"⚠️ Pickle files not found in {_ML_DIR}")
        logger.warning("   Run: cd backend && python -m ml.train_models")

    # ── Step 3: Fallback — load from CSV if pickles are missing ──
    if not pickle_loaded:
        logger.info("📂 Loading skills from CSV (fallback)...")
        _skills_list = _load_skills_from_csv()
        _valid_skills = set(s.lower() for s in _skills_list)
        _category_map = _load_category_map()

        # Train TF-IDF in memory as fallback
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            skill_docs = [f"{s} {s.lower()}" for s in _skills_list]
            _tfidf_vectorizer = TfidfVectorizer(
                analyzer='char_wb', ngram_range=(2, 4),
                max_features=10000, lowercase=True,
            )
            _skill_vectors = _tfidf_vectorizer.fit_transform(skill_docs)
            logger.warning(f"⚠️ TF-IDF trained in-memory (fallback). "
                           f"Run train_models.py to generate pickle files!")
        except ImportError:
            logger.warning("⚠️ scikit-learn not installed — ML matching disabled")
            _tfidf_vectorizer = None
            _skill_vectors = None

    # ── Step 4: Initialize spaCy PhraseMatcher ──
    _matcher = PhraseMatcher(_nlp.vocab, attr="LOWER")
    patterns = [_nlp.make_doc(skill) for skill in _skills_list]
    if patterns:
        _matcher.add("SKILLS", patterns)
        logger.info(f"✅ PhraseMatcher initialized with {len(patterns)} skill patterns")

    _initialized = True
    logger.info(f"✅ NLP service fully initialized ({len(_skills_list)} skills, "
                f"pickle={'YES' if pickle_loaded else 'NO (fallback)'})")


def _load_skills_from_csv() -> List[str]:
    """Load skills from skills.csv — used only as fallback when pickle files are missing."""
    skills_path = os.path.join(os.path.dirname(__file__), "../dataset/skills.csv")
    if not os.path.exists(skills_path):
        logger.error(f"❌ skills.csv NOT FOUND at: {skills_path}")
        return []
    skills = []
    with open(skills_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            skill = row["skill_name"].strip()
            if skill:
                skills.append(skill)
    logger.info(f"✅ Loaded {len(skills)} skills from skills.csv (fallback)")
    return skills


def _load_category_map() -> Dict:
    """Load category map from CSV — used only as fallback."""
    skills_path = os.path.join(os.path.dirname(__file__), "../dataset/skills.csv")
    category_map = {}
    if os.path.exists(skills_path):
        with open(skills_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                category_map[row["skill_name"].lower()] = {
                    "category": row.get("category", "Other"),
                    "difficulty": row.get("difficulty", "Intermediate")
                }
    return category_map


# ─── Synonym normalization map ───
SKILL_ALIASES = {
    r'\breact\s*\.?\s*js\b': 'React',
    r'\bnode\s*\.?\s*js\b': 'Node.js',
    r'\bvue\s*\.?\s*js\b': 'Vue.js',
    r'\bnext\s*\.?\s*js\b': 'Next.js',
    r'\bexpress\s*\.?\s*js\b': 'Express',
    r'\bangular\s*\.?\s*js\b': 'Angular',
    r'\btailwind\s*css\b': 'Tailwind CSS',
    r'\btailwind\b': 'Tailwind CSS',
    r'\bhtml5?\b': 'HTML',
    r'\bcss3?\b': 'CSS',
    r'\bsass\b': 'SASS',
    r'\bscss\b': 'SASS',
    r'\bjavascript\b': 'JavaScript',
    r'\btypescript\b': 'TypeScript',
    r'\bpython\s*3?\b': 'Python',
    r'\bpython\s+programming\b': 'Python',
    r'\bjava\b(?!script)': 'Java',
    r'\bc\+\+\b': 'C++',
    r'\bcpp\b': 'C++',
    r'\bc#\b': 'C#',
    r'\bcsharp\b': 'C#',
    r'\bgolang\b': 'Go',
    r'\brust\s+programming\b': 'Rust',
    r'\bruby\s+programming\b': 'Ruby',
    r'\bswift\s+programming\b': 'Swift',
    r'\bdart\b(?!\s+board)': 'Dart',
    r'\bmongo\s+db\b': 'MongoDB',
    r'\bpostgres(?:ql)?\b': 'PostgreSQL',
    r'\belastic\s+search\b': 'Elasticsearch',
    r'\bdynamo\s+db\b': 'DynamoDB',
    r'\bamazon\s+web\s+services\b': 'AWS',
    r'\bmicrosoft\s+azure\b': 'Azure',
    r'\bgcp\b': 'GCP',
    r'\bgoogle\s+cloud\b': 'GCP',
    r'\bgoogle\s+cloud\s+platform\b': 'GCP',
    r'\bk8s\b': 'Kubernetes',
    r'\bgithub\s+actions\b': 'GitHub Actions',
    r'\bci\s*/?\s*cd\b': 'CI/CD',
    r'\btensor\s+flow\b': 'TensorFlow',
    r'\bpy\s*torch\b': 'PyTorch',
    r'\bscikit[\s-]?learn\b': 'Scikit-Learn',
    r'\bsklearn\b': 'Scikit-Learn',
    r'\bopen\s+cv\b': 'OpenCV',
    r'\bpower\s*bi\b': 'Power BI',
    r'\bmachine\s+learning\b': 'Machine Learning',
    r'\bml\s+engineer\b': 'Machine Learning',
    r'\bml\s+models?\b': 'Machine Learning',
    r'\bml\s+algorithms?\b': 'Machine Learning',
    r'\bnlp\s+(?:models?|pipeline|tasks?|techniques?)\b': 'Natural Language Processing',
    r'\bgen\s*ai\b': 'Generative AI',
    r'\bllms?\b': 'Generative AI',
    r'\blarge\s+language\s+models?\b': 'Generative AI',
    r'\bdata\s+analytics\b': 'Data Analysis',
    r'\bpyspark\b': 'Spark',
    r'\bapache\s+spark\b': 'Spark',
    r'\bapache\s+kafka\b': 'Kafka',
    r'\bapache\s+airflow\b': 'Airflow',
    r'\badobe\s+xd\b': 'Adobe XD',
    r'\bui\s*/?\s*ux\b': 'UI/UX Design',
    r'\buser\s+experience\s+design\b': 'UI/UX Design',
    r'\buser\s+interface\s+design\b': 'UI/UX Design',
    r'\bdesign\s+systems?\b': 'Design Systems',
    r'\bcyber\s*security\b': 'Cybersecurity',
    r'\bethical\s+hacking\b': 'Ethical Hacking',
    r'\bpenetration\s+testing\b': 'Penetration Testing',
    r'\bpen\s*test(?:ing)?\b': 'Penetration Testing',
    r'\bnetwork\s+security\b': 'Network Security',
    r'\bweb\s*3\b': 'Web3',
    r'\bandroid\s+development\b': 'Android Development',
    r'\bandroid\s+dev\b': 'Android Development',
    r'\bios\s+development\b': 'iOS Development',
    r'\bios\s+dev\b': 'iOS Development',
    r'\binternet\s+of\s+things\b': 'IoT',
    r'\brest\s+api\b': 'REST APIs',
    r'\brestful\s+api\b': 'REST APIs',
    r'\brest\s+apis\b': 'REST APIs',
    r'\bwebsockets?\b': 'WebSocket',
    r'\bmicroservices?\b': 'Microservices',
    r'\bdesign\s+patterns?\b': 'Design Patterns',
    r'\bgit\b(?!hub|lab)': 'Git',
    r'\bagile\s+methodology\b': 'Agile',
    r'\btest[\s-]+driven\s+development\b': 'TDD',
    r'\bfast\s+api\b': 'FastAPI',
    r'\bruby\s+on\s+rails\b': 'Ruby on Rails',
    r'\brails\b': 'Ruby on Rails',
    r'\basp\.net\b': 'ASP.NET',
    r'\bapache\s+cassandra\b': 'Cassandra',
    r'\bdata\s+warehouse\b': 'Data Warehousing',
    r'\bdata\s+warehousing\b': 'Data Warehousing',
    r'\bfeature\s+engineering\b': 'Feature Engineering',
    r'\ba\s*/?\s*b\s+testing\b': 'A/B Testing',
    r'\bneural\s+networks?\b': 'Neural Networks',
    r'\bstructured\s+query\s+language\b': 'SQL',
    r'\bresponsive\s+web\s+design\b': 'Responsive Design',
    r'\bcloud\s+computing\b': 'Cloud Computing',
    r'\bmicrosoft\s+excel\b': 'Excel',
    r'\bstatistical\s+analysis\b': 'Statistics',
    r'\bproject\s+management\b': 'Project Management',
    r'\btechnical\s+writing\b': 'Technical Writing',
    r'\bproblem[\s-]+solving\b': 'Problem Solving',
    r'\bcritical\s+thinking\b': 'Critical Thinking',
    r'\bcommunication\s+skills?\b': 'Communication',
    r'\bteam\s+collaboration\b': 'Team Collaboration',
    r'\btime\s+management\b': 'Time Management',
    r'\bpresentation\s+skills?\b': 'Presentation Skills',
    r'\bload\s+balancing\b': 'Load Balancing',
    r'\bmessage\s+queues?\b': 'Message Queues',
    r'\bevent[\s-]+driven\b': 'Event-Driven Architecture',
    r'\bdomain[\s-]+driven\b': 'Domain-Driven Design',
    r'\bapi\s+gateway\b': 'API Gateway',
    r'\bvs\s*code\b': 'VS Code',
    r'\bvisual\s+studio\s+code\b': 'VS Code',
    r'\buser\s+research\b': 'User Research',
    r'\bsecurity\s+auditing\b': 'Security Auditing',
    r'\bsoc\s+analysis\b': 'SOC Analysis',
    r'\bintegration\s+testing\b': 'Integration Testing',
}

# Skills that are common English words — require capitalization in original text
AMBIGUOUS_SKILLS = {
    "Go", "R", "C", "Express", "Linear", "Chef", "Puppet",
    "Windows", "Swift", "Rust", "Excel", "Spark", "Sketch",
    "Bootstrap", "React", "Agile", "Scrum", "Git"
}


def extract_skills_from_text(text: str) -> List[str]:
    """
    Multi-strategy ML-enhanced skill extraction.

    Pipeline:
      1. spaCy PhraseMatcher — exact phrase matching from skills.csv
      2. Regex alias matching — catches abbreviations and variations
      3. TF-IDF cosine similarity — ML fuzzy matching (from pre-trained pickle)
      4. Deduplication, ambiguity filtering, and normalization

    Returns ONLY skills actually found in the text. NO hardcoded fallbacks.
    """
    global _initialized
    if not _initialized:
        init_nlp()

    if not text or len(text.strip()) < 10:
        logger.warning("Text too short for skill extraction")
        return []

    extracted: Set[str] = set()
    text_lower = text.lower()

    logger.info(f"Analyzing text ({len(text)} chars)")

    # ─── Strategy 1: spaCy PhraseMatcher ───
    if _nlp and _matcher:
        doc = _nlp(text_lower)
        matches = _matcher(doc)
        phrase_matches = set()

        for match_id, start, end in matches:
            span = doc[start:end]
            matched_text = span.text.lower()
            for skill in _skills_list:
                if skill.lower() == matched_text:
                    if skill in AMBIGUOUS_SKILLS:
                        original_span = text[span[0].idx:span[-1].idx + len(span[-1])]
                        if original_span == original_span.lower():
                            continue
                    extracted.add(skill)
                    phrase_matches.add(skill)
                    break

        logger.info(f"PhraseMatcher found {len(phrase_matches)} skills: {sorted(phrase_matches)}")

    # ─── Strategy 2: Regex alias matching ───
    regex_matches = set()
    for pattern, skill_name in SKILL_ALIASES.items():
        if re.search(pattern, text_lower, re.IGNORECASE):
            if skill_name.lower() in _valid_skills:
                extracted.add(skill_name)
                regex_matches.add(skill_name)

    logger.info(f"Regex matching found {len(regex_matches)} additional: {sorted(regex_matches - extracted)}")

    # ─── Strategy 3: TF-IDF ML-based fuzzy matching (from pickle) ───
    if _tfidf_vectorizer is not None and _skill_vectors is not None:
        try:
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np

            sentences = re.split(r'[.\n\u2022|,;]+', text_lower)
            ml_matches = set()
            # Snapshot of what was already found by prior strategies
            prior_extracted = set(extracted)

            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) < 5:
                    continue

                # Transform using the PRE-TRAINED vectorizer (loaded from pickle)
                sentence_vector = _tfidf_vectorizer.transform([sentence])
                similarities = cosine_similarity(sentence_vector, _skill_vectors).flatten()

                top_indices = np.where(similarities > 0.35)[0]

                for idx in top_indices:
                    if idx < len(_skills_list):
                        skill = _skills_list[idx]
                        # Verify the skill name actually appears in text
                        if skill.lower() in text_lower:
                            if skill in AMBIGUOUS_SKILLS:
                                if re.search(r'\b' + re.escape(skill) + r'\b', text):
                                    extracted.add(skill)
                                    ml_matches.add(skill)
                            else:
                                extracted.add(skill)
                                ml_matches.add(skill)

            # Skills found by ML that weren't found by PhraseMatcher or Regex
            new_from_ml = ml_matches - prior_extracted
            if new_from_ml:
                logger.info(f"ML matching found {len(new_from_ml)} additional: {sorted(new_from_ml)}")
        except Exception as e:
            logger.warning(f"ML matching failed: {e}")

    # ─── Final deduplication and sort ───
    result = sorted(list(extracted))
    logger.info(f"Total extracted skills: {len(result)} -> {result}")
    return result


def get_skill_categories(skills: list) -> Dict:
    """Get the category breakdown of extracted skills — uses metadata from pickle."""
    global _initialized, _category_map
    if not _initialized:
        init_nlp()

    # If pickle-loaded metadata is available, use it
    if _category_map:
        categorized = {}
        for skill in skills:
            info = _category_map.get(skill.lower(), {"category": "Other", "difficulty": "Intermediate"})
            cat = info["category"]
            if cat not in categorized:
                categorized[cat] = []
            categorized[cat].append({
                "name": skill,
                "difficulty": info["difficulty"]
            })
        return categorized

    # Fallback: load from CSV
    skills_path = os.path.join(os.path.dirname(__file__), "../dataset/skills.csv")
    category_map = {}
    if os.path.exists(skills_path):
        with open(skills_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                category_map[row["skill_name"].lower()] = {
                    "category": row.get("category", "Other"),
                    "difficulty": row.get("difficulty", "Intermediate")
                }

    categorized = {}
    for skill in skills:
        info = category_map.get(skill.lower(), {"category": "Other", "difficulty": "Intermediate"})
        cat = info["category"]
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append({
            "name": skill,
            "difficulty": info["difficulty"]
        })

    return categorized
