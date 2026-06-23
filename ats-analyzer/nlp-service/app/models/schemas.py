# =============================================================
# app/models/schemas.py — Pydantic request/response schemas
# =============================================================

from pydantic import BaseModel, Field
from typing import Optional


# ── Request Bodies ────────────────────────────────────────────

class ParseRequest(BaseModel):
    """Input for resume parsing endpoints."""
    resume_text: str = Field(..., min_length=10, description="Plain text extracted from resume")


class SimilarityRequest(BaseModel):
    """Input for semantic similarity comparison."""
    resume_text: str = Field(..., min_length=10)
    job_description: str = Field(..., min_length=10)


class KeywordRequest(BaseModel):
    """Input for keyword extraction."""
    text: str = Field(..., min_length=10)
    top_n: int = Field(default=30, ge=5, le=100)


class FullAnalysisRequest(BaseModel):
    """Input for the combined full NLP analysis endpoint."""
    resume_text: str = Field(..., min_length=10)
    job_description: Optional[str] = Field(default="", description="Optional job description for matching")


# ── Response Models ───────────────────────────────────────────

class SkillsResponse(BaseModel):
    technical_skills: list[str]
    soft_skills: list[str]
    tools: list[str]
    all_skills: list[str]


class EducationEntry(BaseModel):
    degree: Optional[str]
    institution: Optional[str]
    year: Optional[str]
    raw: str


class EducationResponse(BaseModel):
    entries: list[EducationEntry]
    degrees_found: list[str]
    institutions: list[str]


class ExperienceEntry(BaseModel):
    title: Optional[str]
    company: Optional[str]
    duration: Optional[str]
    raw: str


class ExperienceResponse(BaseModel):
    entries: list[ExperienceEntry]
    total_years_estimated: Optional[float]
    companies: list[str]
    job_titles: list[str]


class NEREntity(BaseModel):
    text: str
    label: str
    description: str


class NERResponse(BaseModel):
    entities: list[NEREntity]
    persons: list[str]
    organizations: list[str]
    locations: list[str]
    dates: list[str]
    emails: list[str]
    phones: list[str]
    urls: list[str]


class KeywordEntry(BaseModel):
    keyword: str
    score: float
    frequency: int


class KeywordResponse(BaseModel):
    keywords: list[KeywordEntry]
    top_keywords: list[str]


class SimilarityResponse(BaseModel):
    semantic_score: float          # 0.0 – 1.0 cosine similarity
    semantic_percent: int          # 0 – 100
    keyword_overlap_score: float   # 0.0 – 1.0 Jaccard similarity
    keyword_overlap_percent: int
    combined_score: float          # weighted average
    combined_percent: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    similarity_label: str          # 'Excellent' | 'Good' | 'Fair' | 'Poor'


class FullAnalysisResponse(BaseModel):
    skills: SkillsResponse
    education: EducationResponse
    experience: ExperienceResponse
    entities: NERResponse
    keywords: KeywordResponse
    similarity: Optional[SimilarityResponse]
    processing_time_ms: float
