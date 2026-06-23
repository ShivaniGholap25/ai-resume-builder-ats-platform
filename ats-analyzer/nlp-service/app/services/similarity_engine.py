# =============================================================
# services/similarity_engine.py — Semantic + keyword similarity
# =============================================================

import re
import math
from collections import Counter
from typing import Optional

# sentence-transformers is loaded lazily to avoid slow startup
_sentence_model = None


def _get_sentence_model():
    """Lazy-load the sentence transformer model (cached after first load)."""
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer
        import numpy as np
        # all-MiniLM-L6-v2 is fast, small (80MB), and accurate for semantic similarity
        _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _sentence_model


# ── Stopwords for keyword overlap ────────────────────────────

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "i", "we", "you", "he", "she", "it", "they",
    "this", "that", "these", "those", "not", "no", "so", "as", "if",
    "also", "well", "just", "very", "more", "most", "some", "any", "all",
    "each", "both", "few", "other", "such", "than", "too", "only", "own",
    "same", "then", "than", "when", "where", "which", "who", "how", "what",
    "our", "your", "their", "its", "my", "his", "her",
}


class SimilarityEngine:
    """
    Computes two types of similarity between resume and job description:

    1. Semantic similarity — using sentence-transformers (cosine similarity
       of dense embeddings). Captures meaning even when exact words differ.

    2. Keyword overlap — Jaccard similarity on cleaned token sets.
       Identifies exact keyword matches and gaps.

    Returns a combined weighted score.
    """

    def compute(self, resume_text: str, job_description: str) -> dict:
        # ── Semantic similarity ───────────────────────────────
        semantic_score = self._semantic_similarity(resume_text, job_description)

        # ── Keyword overlap ───────────────────────────────────
        resume_tokens = self._tokenize(resume_text)
        jd_tokens = self._tokenize(job_description)

        resume_set = set(resume_tokens)
        jd_set = set(jd_tokens)

        intersection = resume_set & jd_set
        union = resume_set | jd_set

        jaccard = len(intersection) / len(union) if union else 0.0

        # Matched = JD keywords found in resume
        matched_keywords = sorted(intersection)[:30]

        # Missing = JD keywords NOT in resume (most frequent first)
        jd_freq = Counter(jd_tokens)
        missing_keywords = sorted(
            [w for w in jd_set - resume_set],
            key=lambda w: -jd_freq.get(w, 0),
        )[:20]

        # ── Combined score (60% semantic, 40% keyword) ────────
        combined = (semantic_score * 0.6) + (jaccard * 0.4)

        # ── Label ─────────────────────────────────────────────
        combined_pct = round(combined * 100)
        label = (
            "Excellent" if combined_pct >= 75 else
            "Good"      if combined_pct >= 55 else
            "Fair"      if combined_pct >= 35 else
            "Poor"
        )

        return {
            "semantic_score": round(semantic_score, 4),
            "semantic_percent": round(semantic_score * 100),
            "keyword_overlap_score": round(jaccard, 4),
            "keyword_overlap_percent": round(jaccard * 100),
            "combined_score": round(combined, 4),
            "combined_percent": combined_pct,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "similarity_label": label,
        }

    def _semantic_similarity(self, text1: str, text2: str) -> float:
        """Compute cosine similarity between two text embeddings."""
        try:
            import numpy as np
            model = _get_sentence_model()

            # Truncate to avoid memory issues
            t1 = text1[:2000]
            t2 = text2[:2000]

            embeddings = model.encode([t1, t2], convert_to_numpy=True)
            e1, e2 = embeddings[0], embeddings[1]

            # Cosine similarity
            dot = float(np.dot(e1, e2))
            norm = float(np.linalg.norm(e1) * np.linalg.norm(e2))
            similarity = dot / norm if norm > 0 else 0.0

            # Clamp to [0, 1]
            return max(0.0, min(1.0, similarity))

        except Exception as e:
            # Fallback to keyword overlap if model fails
            print(f"Semantic similarity fallback: {e}")
            return self._tfidf_cosine_similarity(text1, text2)

    def _tfidf_cosine_similarity(self, text1: str, text2: str) -> float:
        """
        Fallback: TF-IDF cosine similarity without sentence-transformers.
        Used if the model is not available.
        """
        tokens1 = self._tokenize(text1)
        tokens2 = self._tokenize(text2)

        vocab = set(tokens1) | set(tokens2)
        if not vocab:
            return 0.0

        def tf_vector(tokens):
            freq = Counter(tokens)
            total = len(tokens) or 1
            return {w: freq[w] / total for w in vocab}

        v1 = tf_vector(tokens1)
        v2 = tf_vector(tokens2)

        dot = sum(v1[w] * v2[w] for w in vocab)
        norm1 = math.sqrt(sum(v ** 2 for v in v1.values()))
        norm2 = math.sqrt(sum(v ** 2 for v in v2.values()))

        return dot / (norm1 * norm2) if norm1 * norm2 > 0 else 0.0

    def _tokenize(self, text: str) -> list:
        """Clean and tokenize text, removing stopwords."""
        text = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [
            t for t in text.split()
            if len(t) > 2 and t not in STOPWORDS and not t.isdigit()
        ]
        return tokens
