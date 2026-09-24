/** DEMO DATA — fares/deals are illustrative; bookings require approval + provider handoff. */
export interface Destination { id: string; name: string; tags: string; from: number; image: string; code: string }
export const mockDestinations: Destination[] = [
  { id: 'goa', name: 'Goa', tags: 'Beaches • Nightlife', from: 4999, image: '/aura/p/goa.jpg', code: 'Goa (GOI)' },
  { id: 'bali', name: 'Bali', tags: 'Nature • Culture', from: 24999, image: '/aura/p/bali.jpg', code: 'Bali (DPS)' },
  { id: 'dubai', name: 'Dubai', tags: 'Shopping • Luxury', from: 29999, image: '/aura/p/dubai.jpg', code: 'Dubai (DXB)' },
  { id: 'singapore', name: 'Singapore', tags: 'City • Adventure', from: 26999, image: '/aura/p/singapore.jpg', code: 'Singapore (SIN)' },
  { id: 'london', name: 'London', tags: 'History • Culture', from: 49999, image: '/aura/p/london.jpg', code: 'London (LHR)' },
];

export interface TravelDeal { id: string; name: string; offer: string; image: string }
export const mockDeals: TravelDeal[] = [
  { id: 'd1', name: 'Goa Getaway', offer: 'Up to 40% OFF', image: '/aura/p/deal-goa.jpg' },
  { id: 'd2', name: 'Himachal Hills', offer: 'Up to 35% OFF', image: '/aura/p/deal-himachal.jpg' },
  { id: 'd3', name: 'Europe Special', offer: 'From ₹49,999', image: '/aura/p/deal-europe.jpg' },
  { id: 'd4', name: 'Maldives Luxury', offer: 'Up to 50% OFF', image: '/aura/p/deal-maldives.jpg' },
];

export interface FlightResult { id: string; airline: string; code: string; dep: string; arr: string; dur: string; price: number; stops: string }
export function mockFlights(from: string, to: string): FlightResult[] {
  const seed = (from + to).length;
  return [
    { id: 'f1', airline: 'IndiGo', code: '6E-512', dep: '06:10', arr: '07:25', dur: '1h 15m', price: 3200 + seed * 10, stops: 'Non-stop' },
    { id: 'f2', airline: 'Akasa Air', code: 'QP-1321', dep: '14:05', arr: '15:20', dur: '1h 15m', price: 2980 + seed * 12, stops: 'Non-stop' },
    { id: 'f3', airline: 'Air India', code: 'AI-863', dep: '09:40', arr: '11:00', dur: '1h 20m', price: 4150 + seed * 8, stops: 'Non-stop' },
    { id: 'f4', airline: 'SpiceJet', code: 'SG-431', dep: '19:30', arr: '22:45', dur: '3h 15m', price: 2650 + seed * 9, stops: '1 stop' },
  ];
}

export interface Booking { id: string; title: string; detail: string; status: 'Confirmed' | 'Pending approval' }
export const mockBookings: Booking[] = [
  { id: 'b1', title: 'Goa Trip — Flight', detail: 'IndiGo 6E-512 · Oct 24, 06:10', status: 'Confirmed' },
  { id: 'b2', title: 'Goa Trip — Hotel', detail: 'Taj Holiday Village · 4 nights', status: 'Confirmed' },
  { id: 'b3', title: 'Return Flight', detail: 'Akasa QP-1322 · Oct 28, 18:40', status: 'Pending approval' },
];

export const mockItinerary = [
  { day: 'Day 1 · Oct 24', items: ['Arrive GOI 07:25', 'Check-in, beach at Calangute', 'Dinner at Baga'] },
  { day: 'Day 2 · Oct 25', items: ['Fort Aguada', 'Water sports at Candolim', 'Sunset cruise'] },
  { day: 'Day 3 · Oct 26', items: ['Old Goa churches', 'Spice plantation lunch', 'Panjim night market'] },
  { day: 'Day 4 · Oct 27', items: ['Palolem beach day', 'Kayaking', 'Free evening'] },
];
