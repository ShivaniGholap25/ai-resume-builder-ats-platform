# =============================================================
# routers/keywords.py — Keyword extraction endpoints
# =============================================================

from fastapi import APIRouter, HTTPException
from app.models.schemas import KeywordRequest, KeywordResponse
from app.core.nlp_engine import get_nlp_engine

router = APIRouter(prefix="/keywords", tags=["Keyword Extraction"])


@router.post("/extract", response_model=KeywordResponse, summary="Extract keywords from text")
async def extract_keywords(body: KeywordRequest):
    """
    Extract important keywords from any text using TF-IDF scoring.

    Works on both resume text and job descriptions.
    Returns keywords ranked by relevance score with frequency counts.

    - **top_n**: Number of keywords to return (5–100, default 30)
    """
    try:
        engine = get_nlp_engine()
        result = engine.keyword_extractor.extract(body.text, top_n=body.top_n)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Keyword extraction failed: {str(e)}")
