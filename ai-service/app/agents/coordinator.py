from __future__ import annotations

import asyncio

from app.agents.domain_agents import AGENT_REGISTRY
from app.models.schemas import AgentResult

# Simple keyword routing. A production system would use the LLM itself to
# select relevant agents, but keeping this deterministic keeps the
# Coordinator auditable and cheap for the common case.
_KEYWORD_MAP = {
    "travel": ["travel", "flight", "trip", "hotel", "interview"],
    "finance": ["budget", "cost", "money", "price", "finance"],
    "productivity": ["schedule", "task", "meeting", "deadline", "work"],
    "shopping": ["buy", "shop", "purchase", "product"],
    "research": ["research", "find", "learn", "summarize"],
    "calendar": ["calendar", "conflict", "event", "tomorrow", "today"],
    "wellness": ["sleep", "health", "hydration", "workout", "stress"],
    "communication": ["email", "message", "reply", "call"],
}


def select_agents(situation: str) -> list[str]:
    lowered = situation.lower()
    matched = [name for name, keywords in _KEYWORD_MAP.items() if any(k in lowered for k in keywords)]
    return matched or ["productivity"]


class Coordinator:
    """AURA Coordinator: routes a situation to relevant agents, runs them
    concurrently, and aggregates structured results. Never lets one agent
    call another directly."""

    async def consult(self, situation: str, context: dict | None = None) -> list[AgentResult]:
        context = context or {}
        agent_names = select_agents(situation)
        agents = [AGENT_REGISTRY[name]() for name in agent_names if name in AGENT_REGISTRY]

        results = await asyncio.gather(*(agent.run(situation, context) for agent in agents))
        return list(results)


coordinator = Coordinator()
