import { isSupabaseConfigured, supabase } from './supabaseClient';

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
    if (data.session?.provider_token) headers['X-Google-Access-Token'] = data.session.provider_token;
  }
  return headers;
}

/** The signed-in user's session token, for native code that calls the backend itself (the cart agent). */
export async function accessToken(): Promise<string | undefined> {
  if (!isSupabaseConfigured) return undefined;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = await authHeaders(init.body ? { 'Content-Type': 'application/json' } : undefined);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...(init.headers as object) } });
  } catch {
    throw new ApiError(0, 'Cannot reach the AURA backend. Check that it is running.');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, message);
  }
  return res;
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== '') qs.set(k, String(v));
  const res = await request(`${path}${qs.size ? `?${qs}` : ''}`);
  return res.json() as Promise<T>;
}

export async function apiSend<T = void>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const res = await request(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export async function apiBlob(path: string, body: unknown): Promise<Blob> {
  const res = await request(path, { method: 'POST', body: JSON.stringify(body) });
  return res.blob();
}
