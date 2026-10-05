# Deploying AURA to Render (always on, PC not needed)

Two services, defined in `render.yaml`:
- `aura-backend`: public HTTPS API the phone talks to.
- `aura-ai`: private AI service (only the backend can reach it). Its 1 GB disk keeps the learned shopping model.

Cost: two Starter services (about $7/month each) plus the disk. Free plans sleep after 15 minutes, so they aren't used.

## 1. Create it
1. Push this repo to GitHub (done: `Sarveshrock/AURA`).
2. Render dashboard -> **New -> Blueprint** -> select the repo -> Apply.
3. Fill the secrets it asks for (copy from your local `.env`):
   - `aura-backend`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`
   - `aura-ai`: `NVIDIA_API_KEY` (or `OPENROUTER_API_KEY` / `GROK_API_KEY` and change `LLM_PROVIDER`), `GEMINI_API_KEY`, `SERPAPI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Optional `VISION_MODEL` (the model that reads screenshots for "find this").
4. Wait for both to show **Live**. Open `https://<aura-backend>.onrender.com/health`: it should answer OK.

## 2. Point the phone app at it
The server address is baked into the app when it is built:

```bash
cd aura-web
# PowerShell:  $env:VITE_API_URL="https://<aura-backend>.onrender.com"
VITE_API_URL=https://<aura-backend>.onrender.com npm run build
npx cap sync android
```
Then build and install the APK in Android Studio (Build -> Build APK). Use the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as before.

For a release build, remove the home-Wi-Fi IP from `android/app/src/main/res/xml/network_security_config.xml`.

## 3. Updating
Every push to `main` redeploys both services automatically.

## Notes
- Google sign-in: add the Supabase redirect settings as before; they don't depend on where the backend runs.
- If a deploy fails, the **Logs** tab of that service shows why (usually a missing secret).
