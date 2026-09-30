from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services import recommendation_service as reco
from app.services.shopping_service import ShoppingResult, ShoppingServiceError, search_products

router = APIRouter(prefix="/ai/shopping", tags=["shopping"])


@router.get("/search", response_model=list[ShoppingResult])
async def search(q: str = Query(..., min_length=1), max_results: int = Query(20, ge=1, le=50)):
    try:
        return await search_products(q, max_results=max_results)
    except ShoppingServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


class SuggestRequest(BaseModel):
    products: list[dict]


@router.post("/suggestions")
async def suggestions(req: SuggestRequest):
    """Ranks candidate products by predicted interest, using whatever the
    daily-retrained model has learned from the user's interested /
    not-interested feedback so far (falls back to a rating-based heuristic
    before the first model exists)."""
    return {"data": reco.suggest(req.products), "modelStatus": reco.model_status()["status"]}


@router.post("/train")
async def train():
    """Manual trigger for the interest model retrain (also runs daily via
    the scheduler in main.py)."""
    try:
        return await reco.train_model()
    except reco.RecommendationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
