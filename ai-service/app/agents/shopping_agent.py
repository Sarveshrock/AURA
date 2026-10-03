"""AURA's Shopping Agent.

Per command it (1) works out what the user wants, reading the command against their own order history
(the products they usually buy, from the store apps' "Your orders" and carts AURA filled): "milk" becomes their
usual "Amul Taaza Toned Milk 500 ml" x2, "same curd as last time" or "breakfast stuff" resolve to past products;
(2) logs the command so the user's history and the next-purchase model learn from it (and schedules a retrain);
(3) predicts what they will need next, filling gaps ("my usual groceries" -> the predicted basket, no store named
-> where they usually buy these); and (4) for an order, returns a `cartOrder` for the phone's cart agent. If the
store's order history wasn't read in the last week, the cart agent reads it first, then matches the items again.
It stops at the cart: no payment is made (payments are a separate, later integration).
"""
from __future__ import annotations

import asyncio
import re
from collections import Counter

import pandas as pd
import structlog

from app.agents.base import BaseAgent
from app.ml.shopping_catalog import APPS, CATEGORIES, canonical_app, canonical_item, item_category, item_price
from app.ml.shopping_predictor import get_predictor, now_ist, retrain_scheduler
from app.models.schemas import AgentResult
from app.services import shopping_service
from app.services.llm_service import LLMServiceError, llm_service
from app.services.shopping_browser import resolve_store
from app.services.shopping_history import ShoppingHistoryError, shopping_history
from app.services.shopping_memory import history_for_llm, needs_sync, product_profile, resolve_items

logger = structlog.get_logger()
INTENTS = {"order", "suggest", "search", "general"}

_INTENT_PROMPT = """You extract shopping commands for an Indian shopping assistant. Return JSON with exactly these keys:
{{"intent": "order" | "suggest" | "search" | "general",
  "store": store/app name exactly as the user said it, or null,
  "items": [{{"name": product as the user said it (keep brand/size), "qty": integer, "category": one of {cats} or null}}],
  "reorder_usual": true | false,
  "budget_inr": number or null}}
intent: order = wants something bought / added to cart / delivered now ("get me milk", "order eggs from zepto",
"add atta to my blinkit cart", "restock my usual"); suggest = asks what they need, what is running out, what to buy;
search = wants to find or compare products or prices without ordering; general = anything else.
reorder_usual = true when they ask for their usual / regular / the stuff they always buy / whatever is running out
instead of naming items. qty = how many packs/units to put in the cart, default 1: "2 packets of maggi" -> qty 2.
Sizes and counts that describe one pack go in the name, not qty: "a dozen eggs" -> name "eggs 12 pcs", qty 1;
"2 kg atta" -> name "atta 2 kg", qty 1; "two 1L milk" -> name "milk 1 L", qty 2. Known stores (others are fine
too): {apps}.

The user's past orders (item: the exact product they usually buy):
{history}
Relate the command to this history. When they point at it ("my usual milk", "same curd as last time", "what I
ordered last week", "breakfast stuff", "the bread I like"), use those exact past products as item names. A plain
item they have bought before ("milk", "curd") stays plain; it is matched to their usual product later. Never invent
items or a store the user did not say or that isn't in their history."""


def _fallback_intent(text: str) -> dict:
    """Used when the LLM is unavailable: '<verb> a, b x2 and c from <store>'."""
    lowered = text.lower().strip()
    lowered = re.sub(r"^\[shopping\]\s*", "", lowered)
    store = None
    m = re.search(r"\b(?:from|on|via|using)\s+([a-z][a-z .]{1,30})$", lowered)
    if m:
        store, lowered = m.group(1).strip(), lowered[: m.start()].strip()
    verb = re.match(r"^(?:please\s+)?(order|buy|get(?: me)?|add|reorder|restock|purchase)\b\s*", lowered)
    if verb:
        body = lowered[verb.end():]
        usual = bool(re.search(r"\b(usual|regular|always|running out|what i need)\b", body))
        items = []
        if not usual:
            for part in re.split(r",|\band\b|\n", body):
                part = re.sub(r"\b(to|in)\s+(my\s+)?cart\b", "", part).strip(" .")
                if not part:
                    continue
                q = re.match(r"^(\d+)\s*(?:x|packets? of|packs? of|kg of|of)?\s*(.+)$", part) or \
                    re.match(r"^(.+?)\s*[x×]\s*(\d+)$", part)
                if q and q.group(1).isdigit():
                    items.append({"name": q.group(2).strip(), "qty": int(q.group(1))})
                elif q:
                    items.append({"name": q.group(1).strip(), "qty": int(q.group(2))})
                else:
                    items.append({"name": part, "qty": 1})
        return {"intent": "order", "store": store, "items": items, "reorder_usual": usual or not items}
    if re.search(r"\b(what do i need|running out|what should i buy|suggest|need to buy)\b", lowered):
        return {"intent": "suggest", "store": store, "items": [], "reorder_usual": False}
    if re.search(r"\b(find|compare|search|price of|cheapest)\b", lowered):
        q = re.sub(r"^(find|compare|search( for)?|price of|cheapest)\s+", "", lowered)
        return {"intent": "search", "store": store, "items": [{"name": q, "qty": 1}], "reorder_usual": False}
    return {"intent": "general", "store": store, "items": [], "reorder_usual": False}


def _clean_items(raw) -> list[dict]:
    items = []
    for it in raw if isinstance(raw, list) else []:
        if not isinstance(it, dict) or not str(it.get("name") or "").strip():
            continue
        try:
            qty = max(1, min(int(it.get("qty") or 1), 50))
        except (TypeError, ValueError):
            qty = 1
        name = str(it["name"]).strip()[:80]
        cat = it.get("category") if it.get("category") in CATEGORIES else None
        items.append({"name": name, "qty": qty, "category": cat})
    return items[:25]


def _inr(x) -> str:
    return "n/a" if x is None else f"₹{x:,.0f}"


class ShoppingAgent(BaseAgent):
    name = "shopping"

    async def run(self, situation: str, context: dict) -> AgentResult:
        user_id = context.get("userId")
        as_of = pd.Timestamp(context["asOf"]) if context.get("asOf") else now_ist()
        message = re.sub(r"\n\nContext from the user's data:.*", "", situation, flags=re.S)
        events = await self._events(user_id)
        memory = product_profile(events) if events else []
        intent = await self._intent(message, memory)
        kind = intent.get("intent") if intent.get("intent") in INTENTS else "general"
        items = _clean_items(intent.get("items"))
        store_said = (intent.get("store") or "").strip() or None
        notes: list[str] = []
        constraints: list[str] = []
        options: list[str] = []
        data: dict = {"intent": {**intent, "items": items}, "usualProducts": memory[:15]}

        predictor = get_predictor()
        profile = await asyncio.to_thread(predictor.predict, events, as_of, [i["name"] for i in items]) \
            if user_id else None
        data["predictions"] = profile
        preds = (profile or {}).get("nextPurchases") or []

        # ---- order: fill gaps from the model, log it, hand a cart job to the device ----
        if kind == "order":
            if not items:
                items = [{"name": p["item"], "qty": p["usualQty"], "category": p["category"]} for p in preds[:8]]
                if items:
                    notes.append("No items named; using the model's predicted basket: "
                                 + ", ".join(f"{i['name']} x{i['qty']}" for i in items) + ".")
            if not items:
                constraints.append("Nothing to order: no items named and no purchase history to predict from. "
                                   "Ask what they want.")
            else:
                store = canonical_app(store_said) if store_said else self._predicted_store(items, profile)
                if not store_said:
                    notes.append(f"No store named; using {store}, where they usually buy these.")
                resolved = resolve_store(store)
                sync = needs_sync(events, resolved["name"]) and bool(resolved.get("androidPackage") or resolved["known"])
                if not sync:  # history is fresh: match to their usual products now
                    items, matched = resolve_items(items, product_profile(events, store=resolved["name"]))
                    if matched:
                        notes.append("Matched to their usual products from past orders: " + "; ".join(matched) + ".")
                cart_items = [{"name": i["name"], "qty": i["qty"]} for i in items]
                data["cartOrder"] = {"store": resolved["name"], "storeKey": resolved["key"],
                                     "startUrl": resolved["startUrl"], "androidPackage": resolved["androidPackage"],
                                     "appLabel": resolved["appLabel"], "items": cart_items, "autoStart": True,
                                     "syncHistory": sync, "resolved": not sync}
                if sync:
                    notes.append(f"Before adding, AURA will open their {resolved['name']} order history in the app to learn "
                                 "the exact products they usually buy there, then add their usual versions of: "
                                 + ", ".join(f"{i['name']} x{i['qty']}" for i in cart_items) + ".")
                else:
                    notes.append(f"Cart job ready: on the phone AURA will open the {resolved['name']} app (or website) and add "
                                 + ", ".join(f"{i['name']} x{i['qty']}" for i in cart_items) + " to the cart by itself.")
                notes.append("It stops at the cart; payment is not automated yet, the user completes payment.")
                # the command is intent, not a purchase: what actually lands in the cart is logged when the job ends
                await self._log(user_id, [
                    {"action": "add_to_cart", "name": i["name"], "item": canonical_item(i["name"]), "qty": i["qty"],
                     "category": i.get("category") or item_category(canonical_item(i["name"])),
                     "app": resolved["name"], "price": item_price(canonical_item(i["name"])) or 0.0,
                     "source": "agent_command"} for i in items], data, f"order command ({len(items)} items)")

        # ---- search: live prices ----
        elif kind == "search" and items:
            q = items[0]["name"]
            await self._log(user_id, [{"action": "search", "name": q, "item": canonical_item(q),
                                       "app": canonical_app(store_said) if store_said else "AURA",
                                       "source": "agent_command"}], data, "search command")
            try:
                found = await shopping_service.search_products(q, max_results=6)
                data["products"] = [p.model_dump() for p in found[:6]]
                priced = [p for p in found if p.price]
                if priced:
                    notes.append(f"Live prices for '{q}', cheapest first: " + "; ".join(
                        f"{p.title[:60]} {_inr(p.price)} at {p.source}" for p in priced[:4]))
                else:
                    notes.append(f"No priced listings found for '{q}'.")
            except shopping_service.ShoppingServiceError as exc:
                constraints.append(f"Live price search unavailable: {exc}")
            options.append(f"Say 'order {q} from <store>' and AURA will put it in the cart for them.")

        elif kind in ("suggest", "general") and user_id:
            await self._log(user_id, [], data, f"{kind} command")

        # ---- what the model expects them to need ----
        if preds:
            lines = [f"{p['item']} ({round(p['probability'] * 100)}%"
                     + (f", due in ~{p['dueInDays']:.0f}d" if p.get("dueInDays") is not None else "")
                     + (f", usually {p['store']}" if p.get("store") else "") + ")" for p in preds[:6]]
            notes.append("Model forecast, likely to be bought in the next 7 days (suggestions, not certainties): "
                         + "; ".join(lines) + ".")
            for b in (profile or {}).get("suggestedBaskets", [])[:2]:
                if b.get("store"):
                    options.append(f"Reorder from {b['store']}: " + ", ".join(i["name"] for i in b["items"])
                                   + f" (~{_inr(b['estimatedAmountInr'])})")
        elif profile and profile.get("status") == "cold_start":
            notes.append("No past orders on record yet, so there is no personalised shopping forecast.")
        hist = (profile or {}).get("history") or {}
        if hist.get("favouriteStores"):
            notes.append("Shopping habits: mostly " + ", ".join(s["store"] for s in hist["favouriteStores"])
                         + (f"; average order {_inr(hist['averageOrderValueInr'])}" if hist.get("averageOrderValueInr") else "")
                         + ".")

        return AgentResult(agent=self.name, status="completed", insights=["\n".join(notes)] if notes else [],
                           constraints=constraints, options=options, data=data)

    @staticmethod
    def _predicted_store(items: list[dict], profile: dict | None) -> str:
        by_item = {p["item"]: p.get("store") for p in ((profile or {}).get("nextPurchases") or [])
                   + ((profile or {}).get("alsoPossible") or [])}
        votes = Counter(by_item.get(canonical_item(i["name"])) for i in items)
        votes.pop(None, None)
        if votes:
            return votes.most_common(1)[0][0]
        fav = ((profile or {}).get("history") or {}).get("favouriteStores") or []
        return fav[0]["store"] if fav else "Blinkit"

    async def _events(self, user_id: str | None) -> list[dict]:
        if not user_id:
            return []
        try:
            return await shopping_history.get_events(user_id)
        except ShoppingHistoryError as exc:
            logger.warning("shopping_history_unavailable", error=str(exc))
            return []

    async def _log(self, user_id: str | None, events: list[dict], data: dict, reason: str) -> None:
        """Every command is learning signal: store its events, then schedule a (debounced) retrain."""
        if not user_id or user_id == "anonymous":  # no signed-in user: nothing to learn into
            return
        ts = now_ist().isoformat()
        try:
            data["logged"] = await shopping_history.add_events(user_id, [{"timestamp": ts, **e} for e in events])
        except ShoppingHistoryError as exc:
            logger.warning("shopping_event_log_failed", error=str(exc))
            data["logged"] = "failed"
        data["retrain"] = retrain_scheduler.request(reason)

    async def _intent(self, text: str, memory: list[dict] | None = None) -> dict:
        try:
            out = await llm_service.chat_json([
                {"role": "system", "content": _INTENT_PROMPT.format(cats=", ".join(CATEGORIES), apps=", ".join(APPS),
                                                                    history=history_for_llm(memory or []))},
                {"role": "user", "content": text},
            ])
            return out if isinstance(out, dict) else _fallback_intent(text)
        except LLMServiceError as exc:
            logger.warning("shopping_intent_llm_failed", error=str(exc))
            return _fallback_intent(text)
