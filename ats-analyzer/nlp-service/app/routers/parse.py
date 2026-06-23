# =============================================================
# routers/parse.py — Resume parsing endpoints
# =============================================================

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ParseRequest,
    SkillsResponse,
    EducationResponse,
    ExperienceResponse,
    NERResponse,
)
from app.core.nlp_engine import get_nlp_engine

router = APIRouter(prefix="/parse", tags=["Resume Parsing"])


@router.post("/skills", response_model=SkillsResponse, summary="Extract skills from resume")
async def extract_skills(body: ParseRequest):
    """
    Extract technical skills, soft skills, and tools from resume text.

    Returns categorized skill lists using curated dictionaries + spaCy noun chunks.
    """
    try:
        engine = get_nlp_engine()
        result = engine.skill_extractor.extract(body.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")


@router.post("/education", response_model=EducationResponse, summary="Extract education details")
async def extract_education(body: ParseRequest):
    """
    Extract education entries including degrees, institutions, and graduation years.

    Uses regex pattern matching on the education section of the resume.
    """
    try:
        engine = get_nlp_engine()
        result = engine.education_extractor.extract(body.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Education extraction failed: {str(e)}")


@router.post("/experience", response_model=ExperienceResponse, summary="Extract work experience")
async def extract_experience(body: ParseRequest):
    """
    Extract work experience entries including job titles, companies, and durations.

    Also estimates total years of experience from year ranges or explicit mentions.
    """
    try:
        engine = get_nlp_engine()
        result = engine.experience_extractor.extract(body.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Experience extraction failed: {str(e)}")


@router.post("/entities", response_model=NERResponse, summary="Named Entity Recognition")
async def extract_entities(body: ParseRequest):
    """
    Perform Named Entity Recognition (NER) using spaCy's en_core_web_sm model.

    Identifies: persons, organizations, locations, dates, emails, phones, URLs.
    """
    try:
        engine = get_nlp_engine()
        result = engine.ner_extractor.extract(body.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NER extraction failed: {str(e)}")
