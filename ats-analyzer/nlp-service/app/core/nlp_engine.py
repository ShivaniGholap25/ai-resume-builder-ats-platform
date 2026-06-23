# =============================================================
# core/nlp_engine.py — Singleton NLP engine (loads models once)
# =============================================================

import spacy
from app.services.skill_extractor import SkillExtractor
from app.services.education_extractor import EducationExtractor
from app.services.experience_extractor import ExperienceExtractor
from app.services.ner_extractor import NERExtractor
from app.services.keyword_extractor import KeywordExtractor
from app.services.similarity_engine import SimilarityEngine


class NLPEngine:
    """
    Central NLP engine that holds all extractors and the spaCy model.
    Loaded once at startup and reused across all requests.
    """

    def __init__(self):
        print("🔄 Loading spaCy model (en_core_web_sm)...")
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("✅ spaCy model loaded")
        except OSError:
            print("⚠️  spaCy model not found. Run: python -m spacy download en_core_web_sm")
            self.nlp = None

        # Initialize all extractors with the shared spaCy model
        self.skill_extractor = SkillExtractor(nlp=self.nlp)
        self.education_extractor = EducationExtractor()
        self.experience_extractor = ExperienceExtractor()
        self.ner_extractor = NERExtractor(nlp=self.nlp)
        self.keyword_extractor = KeywordExtractor(nlp=self.nlp)
        self.similarity_engine = SimilarityEngine()

        print("✅ All NLP extractors initialized")


# ── Module-level singleton ────────────────────────────────────

_engine: NLPEngine | None = None


def get_nlp_engine() -> NLPEngine:
    """Return the singleton NLP engine instance."""
    global _engine
    if _engine is None:
        _engine = NLPEngine()
    return _engine


def init_nlp_engine():
    """Called at app startup to pre-load all models."""
    get_nlp_engine()
