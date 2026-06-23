# =============================================================
# services/skill_extractor.py — Extract skills using spaCy + curated lists
# =============================================================

import re
from typing import Optional
import spacy

# ── Curated skill dictionaries ────────────────────────────────

TECHNICAL_SKILLS = {
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "perl",
    "bash", "shell", "powershell", "sql", "nosql", "html", "css", "sass", "less",

    # Frameworks & Libraries
    "react", "reactjs", "react.js", "angular", "angularjs", "vue", "vuejs", "vue.js",
    "node", "nodejs", "node.js", "express", "expressjs", "fastapi", "flask", "django",
    "spring", "spring boot", "laravel", "rails", "ruby on rails", "asp.net", ".net",
    "next.js", "nextjs", "nuxt", "svelte", "gatsby", "redux", "graphql", "rest",
    "restful", "grpc", "websocket", "tailwind", "bootstrap", "material ui",

    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "cassandra",
    "dynamodb", "sqlite", "oracle", "mssql", "sql server", "firebase", "supabase",
    "neo4j", "influxdb", "mariadb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
    "ansible", "jenkins", "github actions", "gitlab ci", "circleci", "travis ci",
    "helm", "prometheus", "grafana", "nginx", "apache", "linux", "unix",

    # ML / AI
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
    "pandas", "numpy", "matplotlib", "seaborn", "hugging face", "transformers",
    "bert", "gpt", "llm", "langchain", "openai", "opencv", "spark", "hadoop",

    # Tools
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack",
    "postman", "swagger", "figma", "adobe xd", "webpack", "vite", "babel",
    "eslint", "jest", "pytest", "selenium", "cypress", "playwright",

    # Concepts
    "microservices", "api", "ci/cd", "devops", "agile", "scrum", "kanban",
    "tdd", "bdd", "oop", "functional programming", "design patterns", "solid",
    "data structures", "algorithms", "system design", "distributed systems",
}

SOFT_SKILLS = {
    "communication", "leadership", "teamwork", "problem solving", "problem-solving",
    "critical thinking", "time management", "adaptability", "creativity", "collaboration",
    "project management", "analytical", "attention to detail", "multitasking",
    "presentation", "negotiation", "mentoring", "coaching", "decision making",
    "conflict resolution", "emotional intelligence", "self-motivated", "proactive",
    "organized", "detail-oriented", "fast learner", "quick learner",
}

TOOLS_KEYWORDS = {
    "vs code", "visual studio", "intellij", "pycharm", "eclipse", "xcode",
    "android studio", "jupyter", "colab", "tableau", "power bi", "excel",
    "word", "powerpoint", "notion", "trello", "asana", "monday.com",
    "salesforce", "hubspot", "zendesk", "servicenow",
}


class SkillExtractor:
    """
    Extracts technical skills, soft skills, and tools from resume text.
    Uses both curated keyword matching and spaCy NLP for noun phrase extraction.
    """

    def __init__(self, nlp: Optional[spacy.language.Language] = None):
        self.nlp = nlp

    def extract(self, text: str) -> dict:
        text_lower = text.lower()

        technical = self._match_list(text_lower, TECHNICAL_SKILLS)
        soft = self._match_list(text_lower, SOFT_SKILLS)
        tools = self._match_list(text_lower, TOOLS_KEYWORDS)

        # Use spaCy noun chunks to catch unlisted skills near skill-section headers
        if self.nlp:
            extra = self._extract_from_skills_section(text, technical)
            technical.update(extra)

        all_skills = sorted(technical | soft | tools)

        return {
            "technical_skills": sorted(technical),
            "soft_skills": sorted(soft),
            "tools": sorted(tools),
            "all_skills": all_skills,
        }

    def _match_list(self, text_lower: str, skill_set: set) -> set:
        """Match skills using word-boundary regex for accuracy."""
        found = set()
        for skill in skill_set:
            # Use word boundary for single words, substring for multi-word phrases
            if " " in skill:
                if skill in text_lower:
                    found.add(skill)
            else:
                pattern = r"\b" + re.escape(skill) + r"\b"
                if re.search(pattern, text_lower):
                    found.add(skill)
        return found

    def _extract_from_skills_section(self, text: str, already_found: set) -> set:
        """
        Use spaCy to extract noun phrases from the skills section specifically.
        This catches skills not in our curated list.
        """
        extra = set()
        # Find the skills section
        skills_match = re.search(
            r"(?:skills?|technologies|tech stack|competencies)[:\s\n]+(.*?)(?:\n\n|\Z)",
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if not skills_match:
            return extra

        section_text = skills_match.group(1)[:500]  # Limit to 500 chars
        doc = self.nlp(section_text)

        for chunk in doc.noun_chunks:
            phrase = chunk.text.strip().lower()
            # Only add short, meaningful phrases not already found
            if 2 <= len(phrase) <= 30 and phrase not in already_found:
                # Filter out generic words
                if not any(w in phrase for w in ["the", "a ", "an ", "my ", "our "]):
                    extra.add(phrase)

        return extra
