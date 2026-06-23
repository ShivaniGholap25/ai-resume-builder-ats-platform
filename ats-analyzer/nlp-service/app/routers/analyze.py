# =============================================================
# routers/analyze.py — Full combined NLP analysis endpoint
# =============================================================

import time
from fastapi import APIRouter, HTTPException
from app.models.schemas import FullAnalysisRequest, FullAnalysisResponse
from app.core.nlp_engine import get_nlp_engine

router = APIRouter(prefix="/analyze", tags=["Full Analysis"])


@router.post(
    "/full",
    response_model=FullAnalysisResponse,
    summary="Run complete NLP analysis on a resume",
)
async def full_analysis(body: FullAnalysisRequest):
    """
    Run all NLP analyses in a single request:

    1. **Skills extraction** — technical, soft skills, tools
    2. **Education extraction** — degrees, institutions, years
    3. **Experience extraction** — job titles, companies, durations, total years
    4. **NER** — persons, organizations, locations, dates, contact info
    5. **Keyword extraction** — TF-IDF ranked keywords
    6. **Semantic similarity** — vs job description (if provided)

    This is the primary endpoint called by the Node.js backend.
    """
    start = time.time()

    try:
        engine = get_nlp_engine()

        # Run all extractions
        skills = engine.skill_extractor.extract(body.resume_text)
        education = engine.education_extractor.extract(body.resume_text)
        experience = engine.experience_extractor.extract(body.resume_text)
        entities = engine.ner_extractor.extract(body.resume_text)
        keywords = engine.keyword_extractor.extract(body.resume_text, top_n=30)

        # Similarity only if JD is provided
        similarity = None
        if body.job_description and body.job_description.strip():
            similarity = engine.similarity_engine.compute(
                body.resume_text, body.job_description
            )

        elapsed_ms = round((time.time() - start) * 1000, 2)

        return {
            "skills": skills,
            "education": education,
            "experience": experience,
            "entities": entities,
            "keywords": keywords,
            "similarity": similarity,
            "processing_time_ms": elapsed_ms,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full analysis failed: {str(e)}")
