# =============================================================
# services/experience_extractor.py — Extract work experience
# =============================================================

import re
from typing import Optional


# ── Job title keywords ────────────────────────────────────────

JOB_TITLE_PATTERNS = [
    r"\b(?:senior|junior|lead|principal|staff|associate|chief|head|vp|vice president)?\s*"
    r"(?:software|frontend|backend|full.?stack|mobile|ios|android|web|data|ml|ai|devops|cloud|"
    r"security|qa|test|product|project|program|engineering|solutions|platform|infrastructure|"
    r"site reliability|sre|embedded|systems|network|database|bi|analytics|research|"
    r"machine learning|deep learning|nlp|computer vision)\s*"
    r"(?:engineer|developer|architect|manager|analyst|scientist|designer|consultant|"
    r"specialist|lead|director|officer|intern|trainee|associate|coordinator|administrator|"
    r"technician|programmer|coder|hacker|ninja|guru|wizard|rockstar)?\b",
    r"\b(?:cto|ceo|coo|ciso|vp|svp|evp|director|manager|lead|head)\b",
    r"\bintern(?:ship)?\b",
]

# ── Company indicators ────────────────────────────────────────

COMPANY_SUFFIXES = [
    r"\b(?:inc\.?|ltd\.?|llc\.?|corp\.?|co\.?|pvt\.?|limited|technologies|tech|"
    r"solutions|systems|services|consulting|group|labs|studio|agency|ventures|"
    r"software|digital|global|international|enterprises|holdings)\b",
]

# ── Duration patterns ─────────────────────────────────────────

DURATION_PATTERN = re.compile(
    r"(?:"
    r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
    r"\s*(?:\d{2,4})?"
    r")"
    r"\s*[-–—to]+\s*"
    r"(?:"
    r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
    r"\s*(?:\d{2,4})?"
    r"|present|current|now|till date|to date"
    r")",
    re.IGNORECASE,
)

YEAR_RANGE_PATTERN = re.compile(
    r"\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2}|present|current)\b",
    re.IGNORECASE,
)

YEARS_EXP_PATTERN = re.compile(
    r"(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:experience|exp)",
    re.IGNORECASE,
)


class ExperienceExtractor:
    """
    Extracts work experience entries from resume text.
    Identifies job titles, companies, durations, and estimates total years.
    """

    def extract(self, text: str) -> dict:
        section = self._find_section(text)
        lines = (section or text).split("\n")

        entries = []
        companies = []
        job_titles = []
        total_years = self._estimate_total_years(text)

        for line in lines:
            line = line.strip()
            if not line or len(line) < 5:
                continue

            title = self._extract_job_title(line)
            company = self._extract_company(line)
            duration = self._extract_duration(line)

            if title or company or duration:
                entry = {
                    "title": title,
                    "company": company,
                    "duration": duration,
                    "raw": line[:120],
                }
                entries.append(entry)

                if title and title not in job_titles:
                    job_titles.append(title)
                if company and company not in companies:
                    companies.append(company)

        return {
            "entries": entries[:15],
            "total_years_estimated": total_years,
            "companies": companies[:10],
            "job_titles": job_titles[:10],
        }

    def _find_section(self, text: str) -> Optional[str]:
        """Extract the experience section."""
        match = re.search(
            r"(?:experience|employment|work history|career|professional background)[:\s\n]+"
            r"(.*?)"
            r"(?:\n(?:education|skills?|projects?|certif|summary|objective|awards?|achievements?)\b|\Z)",
            text,
            re.IGNORECASE | re.DOTALL,
        )
        return match.group(1).strip() if match else None

    def _extract_job_title(self, line: str) -> Optional[str]:
        """Find job title in a line."""
        for pattern in JOB_TITLE_PATTERNS:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                title = match.group(0).strip()
                if len(title) > 3:
                    return title[:60]
        return None

    def _extract_company(self, line: str) -> Optional[str]:
        """Find company name in a line."""
        for pattern in COMPANY_SUFFIXES:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                # Return the surrounding context as company name
                start = max(0, match.start() - 40)
                return line[start:match.end()].strip()[:60]
        return None

    def _extract_duration(self, line: str) -> Optional[str]:
        """Find duration/date range in a line."""
        match = DURATION_PATTERN.search(line)
        if match:
            return match.group(0).strip()
        match = YEAR_RANGE_PATTERN.search(line)
        if match:
            return match.group(0).strip()
        return None

    def _estimate_total_years(self, text: str) -> Optional[float]:
        """
        Estimate total years of experience from explicit mentions
        or by summing year ranges found in the text.
        """
        # Check for explicit "X years of experience" statement
        explicit = YEARS_EXP_PATTERN.search(text)
        if explicit:
            return float(explicit.group(1))

        # Sum up year ranges
        ranges = YEAR_RANGE_PATTERN.findall(text)
        total = 0.0
        for start_year, end_year in ranges:
            try:
                start = int(start_year)
                end = 2026 if end_year.lower() in ("present", "current") else int(end_year)
                diff = end - start
                if 0 < diff <= 50:  # Sanity check
                    total += diff
            except ValueError:
                continue

        return round(total, 1) if total > 0 else None
