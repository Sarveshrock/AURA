from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    port: int = 8000

    llm_provider: str = "nvidia"  # "nvidia" | "grok"

    grok_api_key: str = ""
    grok_base_url: str = "https://api.x.ai/v1"
    grok_model: str = "grok-2-latest"

    nvidia_api_key: str = ""
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "mistralai/mistral-nemotron"

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


settings = Settings()
