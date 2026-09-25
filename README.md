# AURA AI — Monorepo

Personal AI decision-maker platform. See [AURA_AI_Claude_Complete_Build_Spec.md](AURA_AI_Claude_Complete_Build_Spec.md) for the full product spec.

## Structure

```
AI_Agent/
  aura-web/       Frontend (React + Vite today; migrate to React Native per spec)
  backend/        Node.js + TypeScript + Express + Supabase (public API boundary)
  ai-service/     Python + FastAPI (NVIDIA NIM LLM + Gemini voice, agent orchestration, external data providers)
  docker-compose.yml
  .env.example
```

## Architecture

```
Frontend  →  Node backend (:4000)  →  Supabase (auth/db/realtime)
                     |
                     v
          Python AI service (:8001, internal only)
                     |
             AURA Coordinator
                     |
      Travel / Finance / Productivity / Shopping /
      Research / Calendar / Wellness / Communication agents
                     |
      SerpAPI (shopping + flights + hotels) · arXiv (research)
```

- **Node backend** is the only public boundary. It proxies AI calls to the Python service and enforces auth via Supabase JWTs + Row Level Security.
- **Python AI service** is never exposed directly to the frontend — only reachable from the backend network.
- **LLMService** (`ai-service/app/services/llm_service.py`) abstracts the model provider. Default: **NVIDIA NIM** (`mistralai/mistral-nemotron`); `GrokProvider` is available via `LLM_PROVIDER=grok`.
- **VoiceService** exists on both sides:
  - `backend/src/services/voice.ts` — `POST /voice/speak`
  - `ai-service/app/services/voice_service.py` — `POST /ai/voice/speak`
  - Default provider: **Gemini TTS** (`gemini-2.5-flash-preview-tts`). `ElevenLabsProvider` available via `VOICE_PROVIDER=elevenlabs`.
- **Shopping** — `ai-service/app/services/shopping_service.py` calls SerpAPI's Google Shopping engine, which aggregates real listings across many retailers in one call, and sorts results lowest-price-first. This is the realistic way to get genuine cross-platform comparison without individually approved retailer partnerships (Amazon PA-API, Flipkart Affiliate, etc. each require their own business approval).
- **Travel** — `ai-service/app/services/travel_service.py` uses SerpAPI's Google Flights + Google Hotels engines (same key as Shopping), sorted lowest-price-first. Amadeus's self-serve developer portal was decommissioned in July 2026; its replacement requires a business agreement, so it wasn't usable here.
- **Research** — `ai-service/app/services/research_service.py` queries the arXiv API (free, no key).
- **Google Calendar + Sign-In** — handled via Supabase Auth's Google OAuth provider on the frontend (`aura-web/src/services/auth.ts`, requests Calendar scopes). The Google access token from the Supabase session is forwarded to `backend/src/routes/calendar.ts` (`GET/POST /calendar/google/events`) via the `X-Google-Access-Token` header — the backend never stores Google credentials itself.
- **Finance & Wellness** stay on the generic Supabase-backed CRUD routes (`/finance`, `/wellness`) — no external price/transaction API is wired in yet (Finance needs a Plaid-equivalent with business approval; Wellness has no natural "compare price" API).

## Setup

```bash
cp .env.example .env
# fill in the keys below
```

Required for each capability:

| Capability | Env vars | Where to get them |
|---|---|---|
| LLM reasoning | `NVIDIA_API_KEY` | https://build.nvidia.com/ |
| Voice | `GEMINI_API_KEY` | https://aistudio.google.com/ |
| Shopping + Travel (flights/hotels) | `SERPAPI_API_KEY` (one key covers all three) | https://serpapi.com/ |
| Database/Auth | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | https://supabase.com/dashboard |
| Google Sign-In + Calendar | Configured in Supabase Dashboard → Authentication → Providers → Google (Client ID/Secret from Google Cloud Console) | https://console.cloud.google.com/ |

**Database schema**: [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) creates every table the backend routes use (tasks, calendar, shopping, travel, finance, wellness, research, memory_items with pgvector, automations, integrations, notifications, agents, decision_sessions, approvals, audit_logs, conversations) with Row Level Security. Apply it once: Supabase Dashboard → SQL Editor → paste the file → Run (or `supabase db push` with the CLI).

Frontend also needs `aura-web/.env` (public values only — no secrets):
```bash
cp aura-web/.env.example aura-web/.env
# VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### Run locally (no Docker)

Run each of these three in its own terminal — all three need to be up at once.

**1. AI service** (Python, port 8001):
```bash
cd ai-service
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt   # or .venv/bin/pip on macOS/Linux
./.venv/Scripts/python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```
> Port 8000 is used as the default elsewhere (Docker, `.env.example`), but on Windows it's commonly reserved by Hyper-V's dynamic port range, which shows up as `[Errno 13] ... forbidden by its access permissions` when you try to bind it. If you hit that, run on a free port instead (8001 above), and set `PYTHON_AI_URL=http://localhost:8001` in the root `.env` to match. Check what's reserved with `netsh interface ipv4 show excludedportrange protocol=tcp` (PowerShell, admin).

**2. Backend** (Node, port 4000):
```bash
cd backend
npm install
npm run dev
```

**3. Frontend** (Vite, port 5173):
```bash
cd aura-web
npm install
npm run dev
```
Then open http://localhost:5173.

### Run with Docker

```bash
docker compose up --build
```

This builds and runs `ai-service` (port 8000 — fine inside its own container, since Windows port reservations only affect the host) and `backend` (port 4000), wired together on the compose network, with health checks gating startup order. The frontend isn't containerized yet; run it separately with step 3 above.

## API surface

Node (`backend/src`):
```
/health /chat /voice /decisions
/shopping (+ GET /shopping/search?q=...)
/travel (+ GET /travel/flights, GET /travel/hotels)
/research (+ GET /research/search?q=...)
/calendar (+ GET/POST /calendar/google/events, DELETE /calendar/google/events/:id)
/tasks /finance /wellness /memory /automations /integrations /notifications /approvals /agents
```

Python (`ai-service/app`):
```
/ai/health /ai/chat /ai/plan /ai/decide /ai/voice/speak
/ai/shopping/search /ai/travel/flights /ai/travel/hotels /ai/research/search
```

## What's real vs. scaffolded

- **Working and verified live**: Express + FastAPI servers, NVIDIA NIM chat, Gemini TTS, keyword-routed multi-agent Coordinator, SerpAPI cross-platform shopping price comparison, SerpAPI flight + hotel search (both sorted lowest-first), arXiv research search, Google Calendar route (pending a connected Google account), Supabase-backed generic CRUD routes (RLS-enforced), Docker images + compose, health checks, structured error handling, rate limiting.
- **Needs your input to fully go live**: a Supabase project + schema (spec §38) for auth/RLS to actually apply; a Google Cloud OAuth client configured in Supabase's Google provider for real Sign-In + Calendar access.
- **Deliberately not attempted**: a generic "every shopping platform" integration — real per-retailer APIs (Amazon, Flipkart, etc.) each require an individually approved partner/affiliate account, not just an API key. SerpAPI's Google Shopping aggregation is the realistic substitute. Same reasoning applies to Finance (real bank data needs a Plaid-equivalent with business approval) — it stays on manual/mock entry.
- **Not yet built**: Supabase schema/migrations, real-time Socket.IO event publishing from agents, React Native migration of the frontend (currently a Vite/React web app), and wiring the screens' UI to these new live endpoints. This pass connected the **Login/Signup screens** to real Supabase Auth (including Google sign-in) end-to-end, and verified the Shopping/Travel/Research backend+AI-service endpoints live via direct API calls — but the Shopping/Travel/Research/Calendar *screens themselves* still render their original mock/demo data and need their fetch logic pointed at the new endpoints (`VITE_API_URL` + the routes listed above) as a follow-up.
