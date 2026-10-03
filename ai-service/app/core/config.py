from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_SERVICE_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # Repo-root .env first, then an optional ai-service/.env that overrides it.
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    environment: str = "development"
    port: int = 8000

    llm_provider: str = "nvidia"  # "nvidia" | "grok"

    grok_api_key: str = ""
    grok_base_url: str = "https://api.x.ai/v1"
    grok_model: str = "grok-2-latest"

    nvidia_api_key: str = ""
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "nvidia/nemotron-3-super-120b-a12b"

    voice_provider: str = "gemini"  # "gemini" | "elevenlabs"

    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"

    gemini_api_key: str = ""
    gemini_tts_model: str = "gemini-2.5-flash-preview-tts"
    gemini_voice_name: str = "Kore"

    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Used for both Shopping (Google Shopping engine) and Travel
    # (Google Flights / Google Hotels engines) — Amadeus's self-service
    # portal was decommissioned, so SerpAPI covers travel too now.
    serpapi_api_key: str = ""
    # Locale for shopping/flight/hotel results (Google country code + ISO currency).
    default_country: str = "in"
    default_currency: str = "INR"

    # Travel next-trip model (trained in synthetic_data/train_improved.py) and the demo users
    # it can be tried on before real AURA users have any travel history.
    travel_model_dir: str = str(_SERVICE_ROOT / "models" / "travel")
    travel_demo_events: str = str(_SERVICE_ROOT / "data" / "demo_travel_events.csv")
    travel_demo_enabled: bool = True

    # Shopping next-purchase model (base trained in synthetic_data/train_shopping.py). Every shopping
    # agent command logs events and schedules a fine-tune on real users' history; the fine-tuned model
    # is written to shopping_model_runtime_dir (not committed) and hot-swapped in.
    shopping_model_dir: str = str(_SERVICE_ROOT / "models" / "shopping")
    shopping_model_runtime_dir: str = str(_SERVICE_ROOT / "app" / "data" / "shopping")
    shopping_demo_events: str = str(_SERVICE_ROOT / "data" / "demo_shopping_events.csv")
    shopping_demo_enabled: bool = True
    # wait this long after the last command before retraining, so a burst of commands trains once
    shopping_retrain_debounce_s: float = 20.0
    # and never retrain more often than this
    shopping_retrain_min_interval_s: float = 120.0
    # The cart agent asks the LLM only for screens its fast path can't handle. It tries this quicker model
    # first (with a short timeout), then the main model (nvidia_model / grok_model). Empty = main model only.
    shopping_agent_model: str = "openai/gpt-oss-20b"
    shopping_agent_timeout_s: float = 25.0


settings = Settings()
