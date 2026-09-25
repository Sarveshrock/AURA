from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.services.shopping_service import ShoppingResult, ShoppingServiceError, search_products

router = APIRouter(prefix="/ai/shopping", tags=["shopping"])


@router.get("/search", response_model=list[ShoppingResult])
async def search(q: str = Query(..., min_length=1), max_results: int = Query(20, ge=1, le=50)):
    try:
        return await search_products(q, max_results=max_results)
    except ShoppingServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
