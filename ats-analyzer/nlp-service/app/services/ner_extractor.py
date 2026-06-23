# =============================================================
# services/ner_extractor.py — Named Entity Recognition using spaCy
# =============================================================

import re
import spacy
from typing import Optional


# ── Contact info regex patterns ───────────────────────────────

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_PATTERN = re.compile(r"(?:\+?\d[\d\s\-().]{7,}\d)")
URL_PATTERN = re.compile(
    r"(?:https?://|www\.)[^\s<>\"{}|\\^`\[\]]+|"
    r"(?:linkedin\.com|github\.com|gitlab\.com|portfolio\.|behance\.net)[^\s<>\"{}|\\^`\[\]]*",
    re.IGNORECASE,
)

# ── spaCy entity label descriptions ──────────────────────────

LABEL_DESCRIPTIONS = {
    "PERSON": "Person name",
    "ORG": "Organization / Company",
    "GPE": "Country / City / State",
    "LOC": "Location",
    "DATE": "Date or time period",
    "PRODUCT": "Product or technology",
    "WORK_OF_ART": "Title of work",
    "EVENT": "Event",
    "LANGUAGE": "Programming or spoken language",
    "NORP": "Nationality or group",
    "FAC": "Facility",
    "MONEY": "Monetary value",
    "PERCENT": "Percentage",
    "CARDINAL": "Number",
    "ORDINAL": "Ordinal number",
    "QUANTITY": "Measurement",
    "TIME": "Time",
    "LAW": "Law or regulation",
}


class NERExtractor:
    """
    Performs Named Entity Recognition using spaCy's en_core_web_sm model.
    Also extracts contact info (email, phone, URLs) using regex.
    """

    def __init__(self, nlp: Optional[spacy.language.Language] = None):
        self.nlp = nlp

    def extract(self, text: str) -> dict:
        entities = []
        persons = []
        organizations = []
        locations = []
        dates = []

        # ── spaCy NER ─────────────────────────────────────────
        if self.nlp:
            # Limit text length for performance
            doc = self.nlp(text[:5000])

            seen = set()
            for ent in doc.ents:
                key = (ent.text.strip(), ent.label_)
                if key in seen or len(ent.text.strip()) < 2:
                    continue
                seen.add(key)

                entity = {
                    "text": ent.text.strip(),
                    "label": ent.label_,
                    "description": LABEL_DESCRIPTIONS.get(ent.label_, ent.label_),
                }
                entities.append(entity)

                label = ent.label_
                text_val = ent.text.strip()

                if label == "PERSON" and text_val not in persons:
                    persons.append(text_val)
                elif label == "ORG" and text_val not in organizations:
                    organizations.append(text_val)
                elif label in ("GPE", "LOC") and text_val not in locations:
                    locations.append(text_val)
                elif label == "DATE" and text_val not in dates:
                    dates.append(text_val)

        # ── Regex-based contact extraction ────────────────────
        emails = list(set(EMAIL_PATTERN.findall(text)))
        phones = list(set(self._clean_phones(PHONE_PATTERN.findall(text))))
        urls = list(set(URL_PATTERN.findall(text)))

        return {
            "entities": entities[:50],  # Cap for response size
            "persons": persons[:5],
            "organizations": organizations[:15],
            "locations": locations[:10],
            "dates": dates[:15],
            "emails": emails[:3],
            "phones": phones[:3],
            "urls": urls[:5],
        }

    def _clean_phones(self, raw_phones: list) -> list:
        """Filter out false positives from phone regex."""
        cleaned = []
        for phone in raw_phones:
            phone = phone.strip()
            # Must have at least 7 digits
            digits = re.sub(r"\D", "", phone)
            if 7 <= len(digits) <= 15:
                cleaned.append(phone)
        return cleaned
