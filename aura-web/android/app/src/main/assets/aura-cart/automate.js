/**
 * Generic "add items to cart" engine for the in-app Cart Assistant WebView.
 * Adapted from browser-extension/content/automate.js — same matching
 * strategy (see that file's header for why it's text-based, not
 * class-name-based), but talks to a native Android bridge instead of
 * chrome.runtime, and the current item/platform are injected as globals
 * by CartAssistantActivity before this script runs (no async handshake
 * needed since everything is same-process).
 *
 * Expected globals, set by the native side via evaluateJavascript before
 * this file runs:
 *   window.__AURA_PLATFORM__  "blinkit" | "zepto" | "instamart"
 *   window.__AURA_ITEM__      {name, qty}
 *   window.__AURA_INDEX__     number
 *   window.__AURA_TOTAL__     number
 */

(async function auraAutomateMain() {
  const widget = auraCreateStatusWidget();
  widget.show();
  await auraProcessItem(window.__AURA_ITEM__, window.__AURA_INDEX__, window.__AURA_TOTAL__, widget);
})();

async function auraProcessItem(item, index, total, widget) {
  widget.update(`Adding ${index + 1}/${total}: ${item.name}…`);

  const result = await auraAddItemToCart(item);
  widget.update(result.ok ? `Added: ${item.name}` : `Couldn't add: ${item.name} — add it yourself once you're in your real cart`);

  const next = JSON.parse(window.AuraNative.handle(JSON.stringify({ type: "ITEM_DONE", ok: result.ok, note: result.note })));

  if (next.done) {
    widget.done();
    return;
  }
  if (next.item) {
    location.href = buildSearchUrl(next.item.name);
  }
}

function buildSearchUrl(query) {
  const q = encodeURIComponent(query);
  switch (window.__AURA_PLATFORM__) {
    case "blinkit":
      return `https://blinkit.com/s/?q=${q}`;
    case "zepto":
      return `https://www.zeptonow.com/search?query=${q}`;
    case "instamart":
      return `https://www.swiggy.com/instamart/search?custom_back=true&query=${q}`;
    default:
      return location.href;
  }
}

async function auraAddItemToCart(item) {
  await auraSleep(1500); // let the SPA render search results after navigation

  const card = await auraWaitFor(() => auraFindMatchingCard(item.name), { timeout: 9000, interval: 300 });
  if (!card) return { ok: false, note: "No matching product found on the results page" };

  const addControl = auraFindAddControl(card);
  if (!addControl) return { ok: false, note: "Found the product but no Add control near it" };

  if (!auraSafeClick(addControl)) {
    return { ok: false, note: "Add control looked like a payment/checkout action — refused to click it" };
  }

  const qty = Math.max(1, Number(item.qty) || 1);
  if (qty > 1) {
    await auraSleep(600);
    for (let i = 1; i < qty; i++) {
      const inc = auraFindIncrementControl(card);
      if (!inc) break;
      auraSafeClick(inc);
      await auraSleep(400);
    }
  }

  return { ok: true, note: `Requested qty ${qty}` };
}

function auraFindMatchingCard(productName) {
  const addButtons = auraFindAllAddButtons();
  for (const btn of addButtons) {
    let node = btn;
    for (let depth = 0; depth < 6 && node; depth++) {
      const text = node.innerText || node.textContent || "";
      if (text.length > 0 && text.length < 500 && auraFuzzyMatch(text, productName)) return node;
      node = node.parentElement;
    }
  }
  return null;
}

function auraFindAllAddButtons() {
  return Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter((el) => {
    if (el.children.length > 2) return false;
    const text = (el.innerText || el.textContent || "").trim();
    const aria = (el.getAttribute("aria-label") || "").trim();
    return /^add$/i.test(text) || /add to cart|add item/i.test(aria);
  });
}

function auraFindAddControl(card) {
  const text = card.innerText || card.textContent || "";
  if (!/\badd\b/i.test(text)) return null;
  const inCard = Array.from(card.querySelectorAll('button, [role="button"], div, span')).filter((el) => {
    if (el.children.length > 2) return false;
    const t = (el.innerText || el.textContent || "").trim();
    const aria = (el.getAttribute("aria-label") || "").trim();
    return /^add$/i.test(t) || /add to cart|add item/i.test(aria);
  });
  return inCard[0] || null;
}

function auraFindIncrementControl(card) {
  const controls = Array.from(card.querySelectorAll('button, [role="button"], div, span')).filter((el) => {
    if (el.children.length > 0) return false;
    const t = (el.innerText || el.textContent || "").trim();
    const aria = (el.getAttribute("aria-label") || "").trim();
    return t === "+" || /increase quantity|increment/i.test(aria);
  });
  return controls[0] || null;
}

function auraCreateStatusWidget() {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;bottom:20px;right:20px;z-index:2147483647;background:#0b0f1a;color:#fff;" +
    "font:14px/1.4 system-ui,sans-serif;padding:12px 16px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.35);" +
    "max-width:320px;display:none;";
  el.innerHTML = '<b style="color:#00d1ff">AURA Cart Assistant</b><div id="aura-status-text" style="margin-top:4px"></div>';
  document.documentElement.appendChild(el);
  const textEl = () => el.querySelector("#aura-status-text");
  return {
    show() { el.style.display = "block"; },
    update(msg) { const t = textEl(); if (t) t.textContent = msg; },
    done() {
      const t = textEl();
      if (t) t.textContent = "Done — tap “Review & pay” below to open your real cart. AURA never completes payment for you.";
      window.AuraNative.handle(JSON.stringify({ type: "ALL_DONE" }));
    },
  };
}
