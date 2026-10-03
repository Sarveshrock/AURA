import { env } from '../config/env.js';

/**
 * Thin client for the internal Python AI service. Node stays the public
 * boundary; the AI service is never exposed directly to the frontend.
 */
async function callAi<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${env.pythonAiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AiServiceError(`AI service ${path} failed with ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

async function getAi<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) query.set(k, String(v));
  const res = await fetch(`${env.pythonAiUrl}${path}?${query.toString()}`);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AiServiceError(`AI service ${path} failed with ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

export class AiServiceError extends Error {}

export const aiClient = {
  chat: (payload: { message: string; userId: string; conversationId?: string }) =>
    callAi<{ reply: string; agentsConsulted: string[] }>('/ai/chat', payload),

  converse: (payload: { message: string; context?: string; history?: { role: 'user' | 'aura'; text: string }[]; pending?: string }) =>
    callAi<{ say: string; do: { type: string; args: Record<string, unknown> }[] }>('/ai/converse', payload),

  plan: (payload: { goal: string; userId: string }) =>
    callAi<{ tasks: unknown[] }>('/ai/plan', payload),

  decide: (payload: { situation: string; userId: string; context?: Record<string, unknown> }) =>
    callAi<{ options: unknown[]; recommendation: string }>('/ai/decide', payload),

  searchShopping: (query: string, maxResults = 20) =>
    getAi<unknown[]>('/ai/shopping/search', { q: query, max_results: maxResults }),

  rankShopping: (products: unknown[]) =>
    callAi<{ data: unknown[]; modelStatus: string }>('/ai/shopping/suggestions', { products }),

  searchFlights: (params: { origin: string; destination: string; departureDate: string; adults?: number }) =>
    getAi<unknown[]>('/ai/travel/flights', {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      adults: params.adults ?? 1,
    }),

  searchHotels: (params: { destination: string; checkInDate: string; checkOutDate: string; adults?: number }) =>
    getAi<unknown[]>('/ai/travel/hotels', {
      destination: params.destination,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults ?? 2,
    }),

  rankTravel: (items: unknown[]) =>
    callAi<{ data: unknown[]; modelStatus: string }>('/ai/travel/suggestions', { items }),

  searchResearch: (query: string, maxResults = 10) =>
    getAi<unknown[]>('/ai/research/search', { q: query, max_results: maxResults }),

  health: async () => {
    const res = await fetch(`${env.pythonAiUrl}/ai/health`);
    if (!res.ok) throw new AiServiceError('AI service health check failed');
    return res.json();
  },
};
