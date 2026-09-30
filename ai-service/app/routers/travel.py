from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services import recommendation_service as reco
from app.services.travel_service import FlightOffer, HotelOffer, TravelServiceError, search_flights, search_hotels

router = APIRouter(prefix="/ai/travel", tags=["travel"])


@router.get("/flights", response_model=list[FlightOffer])
async def flights(
    origin: str = Query(..., min_length=3, max_length=3, description="IATA airport code, e.g. JFK"),
    destination: str = Query(..., min_length=3, max_length=3, description="IATA airport code, e.g. LAX"),
    departureDate: str = Query(..., description="YYYY-MM-DD"),
    adults: int = Query(1, ge=1, le=9),
):
    try:
        return await search_flights(origin, destination, departureDate, adults=adults)
    except TravelServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/hotels", response_model=list[HotelOffer])
async def hotels(
    destination: str = Query(..., min_length=1, description="City or place name, e.g. 'Goa'"),
    checkInDate: str = Query(..., description="YYYY-MM-DD"),
    checkOutDate: str = Query(..., description="YYYY-MM-DD"),
    adults: int = Query(2, ge=1, le=9),
):
    try:
        return await search_hotels(destination, checkInDate, checkOutDate, adults=adults)
    except TravelServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


class SuggestRequest(BaseModel):
    items: list[dict]


@router.post("/suggestions")
async def suggestions(req: SuggestRequest):
    """Ranks flights/hotels by predicted interest, using the model retrained
    daily from the user's like/not-interested feedback on past results
    (falls back to a rating-based heuristic before the first model exists)."""
    return {"data": reco.suggest(req.items, domain="travel"), "modelStatus": reco.model_status("travel")["status"]}


@router.post("/train")
async def train():
    """Manual trigger for the travel interest model retrain (also runs daily via the scheduler in main.py)."""
    try:
        return await reco.train_model("travel")
    except reco.RecommendationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
