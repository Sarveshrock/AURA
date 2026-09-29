/** Fares and hotels come from the live travel API; bookings here are user-approved records (AURA never books or charges). */
export interface FlightResult {
  id: string; airline: string; code: string; dep: string; arr: string; dur: string; price: number; currency: string; stops: string; link?: string;
}

export interface HotelResult { id: string; name: string; perNight?: number; total?: number; currency: string; stars?: string; rating?: number; link?: string }

/** A trip or booking the user saved. */
export interface Booking { id: string; title: string; detail: string; status: 'Saved' | 'Pending approval' | 'Confirmed'; link?: string }

export interface TripPlan { id: string; destination: string; from?: string; startDate: string; endDate: string; days: { day: string; items: string[] }[] }
