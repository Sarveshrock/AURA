"""LLMService abstraction. All model calls go through this module so the
provider (NVIDIA NIM by default, Grok as an alternative) can be swapped
without touching callers."""
from __future__ import annotations

import asyncio
import json
import re
from typing import Any

import httpx

from app.core.config import settings


class LLMServiceError(Exception):
    pass


class LLMProvider:
    async def chat(self, messages: list[dict[str, str]], *, json_mode: bool = False) -> str:
        raise NotImplementedError


def _extract_json_object(text: str) -> str:
    """Strips markdown code fences some providers wrap JSON in, and falls
    back to the first {...} block if the model added surrounding prose."""
    stripped = text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", stripped, re.DOTALL)
    if fence_match:
        return fence_match.group(1)
    brace_match = re.search(r"\{.*\}", stripped, re.DOTALL)
    if brace_match:
        return brace_match.group(0)
    return stripped


class _OpenAICompatibleProvider(LLMProvider):
    """Base for any provider exposing an OpenAI-style /chat/completions
    endpoint (Grok, NVIDIA NIM, and most other hosted LLM gateways)."""

    api_key: str
    base_url: str
    model: str
    label: str
    supports_json_mode: bool = True

    async def chat(self, messages: list[dict[str, str]], *, json_mode: bool = False) -> str:
        if not self.api_key:
            raise LLMServiceError(f"{self.label} API key is not configured.")

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.4,
        }
        if json_mode and self.supports_json_mode:
            payload["response_format"] = {"type": "json_object"}

        # Hosted models occasionally return a transient 5xx or drop the connection; retry those a couple of times.
        resp: httpx.Response | None = None
        last_error = ""
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json=payload,
                    )
            except httpx.HTTPError as exc:
                last_error = f"{type(exc).__name__}: {exc}"
                resp = None
            else:
                if resp.status_code < 500 and resp.status_code != 429:
                    break
                last_error = f"{resp.status_code}: {resp.text[:200]}"
            if attempt < 2:
                await asyncio.sleep(1.5 * (attempt + 1))
        if resp is None or resp.status_code >= 500 or resp.status_code == 429:
            raise LLMServiceError(f"{self.label} is temporarily unavailable ({last_error})")
        if resp.status_code >= 400:
            raise LLMServiceError(f"{self.label} request failed ({resp.status_code}): {resp.text}")

        data = resp.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise LLMServiceError(f"Unexpected {self.label} response shape: {data}") from exc


class GrokProvider(_OpenAICompatibleProvider):
    label = "Grok"

    def __init__(self) -> None:
        self.api_key = settings.grok_api_key
        self.base_url = settings.grok_base_url
        self.model = settings.grok_model


class NvidiaProvider(_OpenAICompatibleProvider):
    """NVIDIA NIM (integrate.api.nvidia.com) — OpenAI-compatible endpoint.
    Not every hosted model supports response_format=json_object, so JSON
    output is enforced via prompting + lenient extraction instead."""

    label = "NVIDIA NIM"
    supports_json_mode = False

    def __init__(self) -> None:
        self.api_key = settings.nvidia_api_key
        self.base_url = settings.nvidia_base_url
        self.model = settings.nvidia_model


_PROVIDERS: dict[str, type[_OpenAICompatibleProvider]] = {
    "nvidia": NvidiaProvider,
    "grok": GrokProvider,
}


def _build_provider() -> LLMProvider:
    provider_cls = _PROVIDERS.get(settings.llm_provider, NvidiaProvider)
    return provider_cls()


class LLMService:
    def __init__(self, provider: LLMProvider):
        self._provider = provider

    async def chat(self, messages: list[dict[str, str]]) -> str:
        return await self._provider.chat(messages)

    async def chat_json(self, messages: list[dict[str, str]]) -> dict[str, Any]:
        json_instruction = {
            "role": "system",
            "content": "Respond with ONLY a single valid JSON object. No markdown, no commentary.",
        }
        raw = await self._provider.chat([json_instruction, *messages], json_mode=True)
        candidate = _extract_json_object(raw)
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as exc:
            raise LLMServiceError(f"Model did not return valid JSON: {raw}") from exc


llm_service = LLMService(_build_provider())
