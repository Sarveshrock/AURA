/**
 * Product matching for the Cart Assistant. Pure text logic plus one DOM helper — no clicking happens here.
 *
 * The old matcher took the first card whose text contained every word of "milk", so it could add chocolate milk,
 * milk powder or a milkshake. This one reads each product card and only accepts a card that
 *   - names the item (item.head),
 *   - is not something else (item.exclude: "chocolate", "powder"…),
 *   - has every variant the user asked for (item.must: toned / veg + steamed…),
 *   - has no word for a conflicting variant (item.avoid: "full cream" when toned was asked),
 *   - has the asked size and brand,
 * and among the cards that qualify, picks the best-scoring one. If none qualifies it reports why instead of guessing —
 * adding nothing is better than adding the wrong thing.
 *
 * `item` comes from the app: { name, qty, head?, must?, avoid?, exclude?, size?, brand? }.
 */

function auraNormText(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9.\s]/g, " ").replace(/\s+/g, " ").trim();
}

function auraEsc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word match that also accepts a plural ("momo" ~ "momos", "egg" ~ "eggs"). */
function auraHas(hay, term) {
  const t = auraNormText(term);
  if (!t) return false;
  return new RegExp("(?<![a-z0-9])" + auraEsc(t) + "(?:s|es)?(?![a-z0-9])").test(hay);
}

var AURA_NOISE_LINE =
  /^(add|ad+|₹\s*[\d,.]+.*|rs\.?\s*[\d,.]+.*|\d+\s*(mins?|minutes?)|\d+(\.\d+)?\s*%?\s*off|[\d,.]+\s*off|bestseller|new|sold out|out of stock|notify me|customi[sz]able|[\d.]+\s*★?|\([\d.]+[kK]?\)|veg|non[- ]?veg)$/i;

/** Drops price / ADD / delivery-time / rating lines so only the product's own words are scored. */
function auraCleanCardText(text) {
  return String(text || "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l && !AURA_NOISE_LINE.test(l))
    .join(" ");
}

/** Size as a comparable number: "500 ml" -> {u:"vol",v:500}, "1 l" -> {u:"vol",v:1000}, "200 g", "1 kg" -> {u:"wt"}, "12" -> {u:"n"}. */
function auraParseSize(str) {
  const m = auraNormText(str).match(/^(\d+(?:\.\d+)?)\s*(ml|l|g|kg)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (m[2] === "ml") return { u: "vol", v: n };
  if (m[2] === "l") return { u: "vol", v: n * 1000 };
  if (m[2] === "g") return { u: "wt", v: n };
  if (m[2] === "kg") return { u: "wt", v: n * 1000 };
  return { u: "n", v: n };
}

function auraSizeMatches(hay, wanted) {
  const w = auraParseSize(wanted);
  if (!w) return true;
  if (w.u === "n") return new RegExp("(?<![a-z0-9.])" + w.v + "(?![a-z0-9.])").test(hay);
  const re = /(\d+(?:\.\d+)?)\s*(ml|ltrs?|litres?|liters?|l|kgs?|gms?|grams?|g)(?![a-z])/g;
  let m;
  while ((m = re.exec(hay))) {
    const u = m[2];
    const n = Number(m[1]);
    const parsed = /^(l|ltrs?|litres?|liters?)$/.test(u) ? { u: "vol", v: n * 1000 }
      : u === "ml" ? { u: "vol", v: n }
      : /^kgs?$/.test(u) ? { u: "wt", v: n * 1000 }
      : { u: "wt", v: n };
    if (parsed.u === w.u && Math.abs(parsed.v - w.v) < 0.5) return true;
  }
  return false;
}

/** A group of synonyms is satisfied if any appears — ignoring avoid-phrases that merely contain it ("toned" inside "double toned"). */
function auraGroupMatches(hay, group, avoid) {
  let masked = hay;
  for (const a of (avoid || []).slice().sort((x, y) => y.length - x.length)) {
    if (group.some((t) => auraNormText(a).includes(auraNormText(t)) && auraNormText(a) !== auraNormText(t))) {
      masked = masked.replace(new RegExp("(?<![a-z0-9])" + auraEsc(auraNormText(a)) + "(?![a-z0-9])", "g"), " ");
    }
  }
  return group.some((t) => auraHas(masked, t));
}

/**
 * Scores one card's text against the item. Returns {ok:true, score, title} or {ok:false, why}.
 */
function auraScoreCard(cardText, item) {
  const clean = auraCleanCardText(cardText);
  const hay = auraNormText(clean);
  if (!hay) return { ok: false, why: "empty" };

  if (!item.head || !item.head.length) {
    // Unknown kind of item: fall back to "every word of the search must appear".
    const ok = typeof auraFuzzyMatch === "function" ? auraFuzzyMatch(clean, item.name) : hay.includes(auraNormText(item.name));
    return ok ? { ok: true, score: 5, title: clean.slice(0, 80) } : { ok: false, why: "words" };
  }

  if (!item.head.some((h) => auraHas(hay, h))) return { ok: false, why: "not " + item.head[0] };
  for (const e of item.exclude || []) if (auraHas(hay, e)) return { ok: false, why: "is " + e };
  for (const g of item.must || []) if (!auraGroupMatches(hay, g, item.avoid)) return { ok: false, why: "not " + g[0] };
  for (const a of item.avoid || []) {
    // An avoid-phrase that contains a wanted term ("double toned" ⊃ "toned") was already masked when checking `must`.
    const containsWanted = (item.must || []).some((g) => g.some((t) => auraNormText(a).includes(auraNormText(t))));
    if (!containsWanted && auraHas(hay, a)) return { ok: false, why: "is " + a };
  }
  if (item.size && !auraSizeMatches(hay, item.size)) return { ok: false, why: "size " + item.size };
  if (item.brand && !auraHas(hay, item.brand)) return { ok: false, why: "brand " + item.brand };

  let score = 10 + 5 * (item.must || []).length + (item.brand ? 8 : 0) + (item.size ? 6 : 0);
  score -= hay.length / 120; // a plain product beats a long "combo / bundle" title
  return { ok: true, score, title: clean.replace(/\s+/g, " ").slice(0, 90) };
}

/**
 * The card around an ADD button: climb while the ancestor still contains only this one ADD button.
 * @param btn   the ADD element
 * @param all   Set of every ADD element on the page
 */
function auraCardFor(btn, all) {
  let best = btn.parentElement || btn;
  let node = btn.parentElement;
  while (node && node.parentElement) {
    let count = 0;
    all.forEach((b) => { if (node.contains(b)) count++; });
    const len = (node.innerText || "").length;
    if (count !== 1 || len > 700) break;
    best = node;
    node = node.parentElement;
  }
  return best;
}

/** Best qualifying card on the page, or {card:null, reason, seen}. Needs auraFindAllAddButtons() from automate.js. */
function auraFindBestCard(item) {
  const buttons = auraFindAllAddButtons();
  if (!buttons.length) return { card: null, reason: "no-products", seen: 0 };
  const all = new Set(buttons);
  let best = null;
  const why = {};
  for (const btn of buttons) {
    const card = auraCardFor(btn, all);
    const r = auraScoreCard(card.innerText || card.textContent || "", item);
    if (r.ok) {
      if (!best || r.score > best.score) best = { card, score: r.score, title: r.title };
    } else {
      why[r.why] = (why[r.why] || 0) + 1;
    }
  }
  if (best) return { card: best.card, title: best.title, seen: buttons.length };
  const top = Object.entries(why).sort((a, b) => b[1] - a[1])[0];
  return { card: null, reason: top ? top[0] : "no-match", seen: buttons.length };
}

if (typeof module !== "undefined") {
  module.exports = { auraNormText, auraHas, auraCleanCardText, auraParseSize, auraSizeMatches, auraScoreCard, auraGroupMatches };
}
