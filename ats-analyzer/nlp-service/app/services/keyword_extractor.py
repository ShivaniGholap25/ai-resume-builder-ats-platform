# =============================================================
# services/keyword_extractor.py — TF-IDF keyword extraction
# =============================================================

import re
import math
from collections import Counter
from typing import Optional
import spacy


# ── English stopwords (extended) ─────────────────────────────

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "up", "about", "into", "through", "during",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "shall", "can", "need", "dare", "ought", "used", "able",
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "he", "him", "his", "himself",
    "she", "her", "hers", "herself", "it", "its", "itself",
    "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those",
    "am", "not", "no", "nor", "so", "yet", "both", "either", "neither",
    "each", "few", "more", "most", "other", "some", "such",
    "than", "too", "very", "just", "because", "as", "until", "while",
    "also", "well", "back", "even", "still", "way", "take", "every",
    "good", "new", "first", "last", "long", "great", "little", "own",
    "right", "big", "high", "different", "small", "large", "next",
    "early", "young", "important", "public", "private", "real", "best",
    "free", "work", "using", "used", "use", "make", "made", "making",
    "including", "based", "across", "within", "between", "among",
    "responsible", "ability", "strong", "experience", "knowledge",
    "understanding", "skills", "skill", "years", "year", "team",
    "company", "role", "position", "job", "candidate", "required",
    "preferred", "plus", "bonus", "etc", "eg", "ie",
}


class KeywordExtractor:
    """
    Extracts important keywords from text using TF-IDF scoring.
    Supports both single-word and bigram extraction.
    Uses spaCy for lemmatization when available.
    """

    def __init__(self, nlp: Optional[spacy.language.Language] = None):
        self.nlp = nlp

    def extract(self, text: str, top_n: int = 30) -> dict:
        tokens = self._tokenize(text)
        unigrams = self._get_ngrams(tokens, 1)
        bigrams = self._get_ngrams(tokens, 2)

        # Score using TF (term frequency) + IDF approximation
        all_terms = {**unigrams, **bigrams}
        scored = self._score_terms(all_terms, len(tokens))

        # Sort by score descending
        sorted_terms = sorted(scored.items(), key=lambda x: x[1]["score"], reverse=True)

        keywords = [
            {
                "keyword": term,
                "score": round(data["score"], 4),
                "frequency": data["freq"],
            }
            for term, data in sorted_terms[:top_n]
        ]

        top_keywords = [k["keyword"] for k in keywords[:20]]

        return {
            "keywords": keywords,
            "top_keywords": top_keywords,
        }

    def _tokenize(self, text: str) -> list:
        """Tokenize and lemmatize text."""
        # Clean text
        text = re.sub(r"[^\w\s\-+#.]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()

        if self.nlp:
            doc = self.nlp(text[:8000])
            tokens = []
            for token in doc:
                if (
                    not token.is_stop
                    and not token.is_punct
                    and not token.is_space
                    and len(token.lemma_) > 2
                    and token.lemma_.lower() not in STOPWORDS
                    and not token.like_num
                ):
                    tokens.append(token.lemma_.lower())
        else:
            # Fallback: simple split + filter
            raw_tokens = text.lower().split()
            tokens = [
                t.strip(".,;:!?()[]{}\"'")
                for t in raw_tokens
                if len(t) > 2 and t not in STOPWORDS
            ]

        return tokens

    def _get_ngrams(self, tokens: list, n: int) -> dict:
        """Generate n-grams and count frequencies."""
        ngrams = []
        for i in range(len(tokens) - n + 1):
            gram = " ".join(tokens[i : i + n])
            ngrams.append(gram)
        return dict(Counter(ngrams))

    def _score_terms(self, term_freq: dict, total_tokens: int) -> dict:
        """
        Score terms using TF * log(1 + freq) weighting.
        Bigrams get a 1.5x boost since they're more specific.
        """
        scored = {}
        max_freq = max(term_freq.values()) if term_freq else 1

        for term, freq in term_freq.items():
            if freq < 1:
                continue

            # Skip very short or stopword-only terms
            words = term.split()
            if all(w in STOPWORDS for w in words):
                continue
            if any(len(w) < 2 for w in words):
                continue

            # TF score (normalized)
            tf = freq / max_freq

            # IDF approximation: rarer terms score higher
            idf = math.log(1 + (total_tokens / (freq + 1)))

            # Bigram boost
            boost = 1.5 if len(words) > 1 else 1.0

            score = tf * idf * boost

            scored[term] = {"score": score, "freq": freq}

        return scored
