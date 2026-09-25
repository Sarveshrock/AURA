from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

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
