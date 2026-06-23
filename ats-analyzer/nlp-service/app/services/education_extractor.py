# =============================================================
# services/education_extractor.py — Extract education details
# =============================================================

import re
from typing import Optional


# ── Degree patterns ───────────────────────────────────────────

DEGREE_PATTERNS = [
    r"\bph\.?d\.?\b",
    r"\bdoctor(?:ate)?\b",
    r"\bmaster(?:\'s|s)?\s+(?:of\s+)?(?:science|arts|engineering|business|technology|mba|ms|ma|mtech|mca|msc)\b",
    r"\bm\.?s\.?\b",
    r"\bm\.?b\.?a\.?\b",
    r"\bm\.?tech\.?\b",
    r"\bm\.?c\.?a\.?\b",
    r"\bm\.?sc\.?\b",
    r"\bm\.?a\.?\b",
    r"\bbachelor(?:\'s|s)?\s+(?:of\s+)?(?:science|arts|engineering|technology|commerce|business|bsc|ba|be|btech|bca|bcom)\b",
    r"\bb\.?s\.?\b",
    r"\bb\.?e\.?\b",
    r"\bb\.?tech\.?\b",
    r"\bb\.?c\.?a\.?\b",
    r"\bb\.?com\.?\b",
    r"\bb\.?sc\.?\b",
    r"\bb\.?a\.?\b",
    r"\bassociate(?:\'s|s)?\s+(?:of\s+)?(?:science|arts|applied science)\b",
    r"\ba\.?s\.?\b",
    r"\ba\.?a\.?\b",
    r"\bdiploma\b",
    r"\bcertificate\b",
    r"\bhigh school\b",
    r"\bsecondary\b",
    r"\bmatriculation\b",
    r"\bintermediate\b",
    r"\b10\+2\b",
    r"\bsslc\b",
    r"\bhsc\b",
]

# ── Year patterns ─────────────────────────────────────────────

YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")
YEAR_RANGE_PATTERN = re.compile(r"\b(19|20)\d{2}\s*[-–—to]+\s*(?:(19|20)\d{2}|present|current)\b", re.IGNORECASE)

# ── University / College keywords ────────────────────────────

INSTITUTION_KEYWORDS = [
    "university", "college", "institute", "school", "academy",
    "polytechnic", "iit", "nit", "bits", "mit", "stanford", "harvard",
    "oxford", "cambridge", "iim", "iisc",
]


class EducationExtractor:
    """
    Extracts education entries from resume text using regex patterns.
    Identifies degrees, institutions, and graduation years.
    """

    def extract(self, text: str) -> dict:
        # Find the education section
        section = self._find_section(text)
        lines = section.split("\n") if section else text.split("\n")

        entries = []
        degrees_found = []
        institutions = []

        for line in lines:
            line = line.strip()
            if not line or len(line) < 5:
                continue

            degree = self._extract_degree(line)
            institution = self._extract_institution(line)
            year = self._extract_year(line)

            if degree or institution:
                entry = {
                    "degree": degree,
                    "institution": institution,
                    "year": year,
                    "raw": line,
                }
                entries.append(entry)

                if degree and degree not in degrees_found:
                    degrees_found.append(degree)
                if institution and institution not in institutions:
                    institutions.append(institution)

        return {
            "entries": entries[:10],  # Cap at 10 entries
            "degrees_found": degrees_found,
            "institutions": institutions,
        }

    def _find_section(self, text: str) -> Optional[str]:
        """Extract the education section from the resume."""
        match = re.search(
            r"(?:education|academic|qualification|degree)[:\s\n]+(.*?)(?:\n(?:experience|skills?|projects?|certif|work|employment|summary|objective)\b|\Z)",
            text,
            re.IGNORECASE | re.DOTALL,
        )
        return match.group(1).strip() if match else None

    def _extract_degree(self, line: str) -> Optional[str]:
        """Find degree mention in a line."""
        line_lower = line.lower()
        for pattern in DEGREE_PATTERNS:
            match = re.search(pattern, line_lower)
            if match:
                # Return a cleaned version of the matched text
                return match.group(0).upper().replace(".", "").strip()
        return None

    def _extract_institution(self, line: str) -> Optional[str]:
        """Find institution name in a line."""
        line_lower = line.lower()
        for keyword in INSTITUTION_KEYWORDS:
            if keyword in line_lower:
                # Return the full line as institution (trimmed)
                return line[:80].strip()
        return None

    def _extract_year(self, line: str) -> Optional[str]:
        """Extract year or year range from a line."""
        range_match = YEAR_RANGE_PATTERN.search(line)
        if range_match:
            return range_match.group(0)
        year_match = YEAR_PATTERN.search(line)
        if year_match:
            return year_match.group(0)
        return None
