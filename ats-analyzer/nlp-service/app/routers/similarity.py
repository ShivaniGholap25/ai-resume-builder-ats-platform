# =============================================================
# routers/similarity.py — Similarity scoring endpoints
# =============================================================

from fastapi import APIRouter, HTTPException
from app.models.schemas import SimilarityRequest, SimilarityResponse
from app.core.nlp_engine import get_nlp_engine

router = APIRouter(prefix="/similarity", tags=["Similarity Scoring"])


@router.post("/score", response_model=SimilarityResponse, summary="Compute resume-JD similarity")
async def compute_similarity(body: SimilarityRequest):
    """
    Compute semantic and keyword similarity between a resume and job description.

    **Two scoring methods:**
    - **Semantic similarity** (60% weight): Uses `sentence-transformers` (all-MiniLM-L6-v2)
      to compute cosine similarity of dense embeddings. Captures meaning even when
      exact words differ (e.g., "built" vs "developed").

    - **Keyword overlap** (40% weight): Jaccard similarity on cleaned token sets.
      Identifies exact keyword matches and gaps.

    **Returns:**
    - Combined score (0–100)
    - Matched keywords (found in both)
    - Missing keywords (in JD but not resume)
    - Similarity label: Excellent / Good / Fair / Poor
    """
    try:
        engine = get_nlp_engine()
        result = engine.similarity_engine.compute(body.resume_text, body.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity computation failed: {str(e)}")
