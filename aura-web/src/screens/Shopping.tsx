import { useState } from 'react';
import { CheckCircle2, ArrowRight, ChevronRight, ChevronLeft, ShoppingCart, Mic, CalendarDays, Store, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Hud, PageHero, NeonButton, Toggle, FuturisticModal, DemoFlag, toast, toneHex } from '../components/aura';
import { AICommandPanel, confirmActions, type AIReply } from '../components/ai';
import { ProductCard, CartLine, inr } from '../components/shopping';
import { categories, mockProducts, type ProductCategory } from '../data/mockProducts';
import { cartStore, wishlistStore, subscriptionsStore } from '../state/stores';
import { usePageSearch, matches } from '../state/search';

export default function Shopping() {
  const cart = cartStore.use();
  const wish = wishlistStore.use();
  const subs = subscriptionsStore.use();
  const q = usePageSearch();
  const [cat, setCat] = useState<'All' | ProductCategory>('All');
  const [all, setAll] = useState(false);
  const [catStart, setCatStart] = useState(0);
  const [checkout, setCheckout] = useState(false);

  const list = mockProducts.filter((p) => (cat === 'All' || p.category === cat) && matches(q, p.name, p.category, p.provider));
  const shown = all ? list : list.slice(0, 5);
  const lines = Object.entries(cart).filter(([, n]) => n > 0).map(([id, n]) => ({ p: mockProducts.find((x) => x.id === id)!, n })).filter((l) => l.p);
  const total = lines.reduce((s, l) => s + l.p.price * l.n, 0);
  const count = lines.reduce((s, l) => s + l.n, 0);
  const setQty = (id: string, d: number) => cartStore.set((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const addToCart = (id: string, n = 1) => cartStore.set((c) => ({ ...c, [id]: (c[id] ?? 0) + n }));
  const byProvider = lines.reduce<Record<string, typeof lines>>((acc, l) => ({ ...acc, [l.p.provider]: [...(acc[l.p.provider] ?? []), l] }), {});

  const ai = (p: string): AIReply => {
    const t = p.toLowerCase();
    if (/grocer/.test(t)) {
      const items = subs.filter((s) => s.active).map((s) => mockProducts.find((x) => x.id === s.productId)!).filter(Boolean);
      return { text: `Your monthly essentials from active subscriptions come to ${inr(items.reduce((s, x) => s + x.price, 0))}. I compared providers — these are the lowest unit prices right now.`,
        preview: items.map((x) => `Add ${x.name} · ${inr(x.price)} · ${x.provider}`),
        actions: confirmActions('Add to Smart Cart', () => { items.forEach((x) => addToCart(x.id)); return `${items.length} essentials added to your Smart Cart. Nothing is ordered until you check out.`; }) };
    }
    const budget = t.match(/under\s*(\d+)\s*k/);
    const words = t.replace(/(buy|find|order|reorder|my|a|an|the|under\s*\d+\s*k)/g, ' ').split(/\s+/).filter((w) => w.length > 2);
    const hit = mockProducts.find((x) => words.some((w) => x.name.toLowerCase().includes(w) || x.category.toLowerCase().includes(w.replace(/s$/, ''))));
    if (!hit) return { text: `I couldn't find “${p}” in the demo catalogue. With providers connected, I would search Amazon, Flipkart and BigBasket and compare unit prices.` };
    if (budget && hit.price > Number(budget[1]) * 1000) {
      return { text: `The closest match, ${hit.name}, is ${inr(hit.price)} — above your ₹${budget[1]}k budget. I can watch for a price drop and alert you.`,
        actions: confirmActions('Set price alert', () => `Price alert set for ${hit.name} below ₹${budget[1]},000 (demo).`) };
    }
    const alt = Math.round(hit.price * 1.07);
    return { text: `Best option: ${hit.name} at ${inr(hit.price)} on ${hit.provider}${hit.unit ? ` (${hit.unit})` : ''}. The next-best provider is ${inr(alt)}.`,
      preview: [`Add 1 × ${hit.name} · ${inr(hit.price)} · ${hit.provider}`],
      actions: confirmActions('Add to cart', () => { addToCart(hit.id); return `${hit.name} added to your Smart Cart.`; }) };
  };

  const visibleCats = categories.slice(catStart, catStart + 10);

  return (
    <div className="module">
      <div className="main">
        <PageHero title={<>Shop <span className="grad-cyan">Smarter</span><br />with <span className="grad">AURA</span></>}
          lead="Tell AURA what you need. It finds the best products, compares prices, and can even order for you — with your approval."
          image="/aura/hero-shopping.jpg" imageWidth="40%" quote="From daily essentials to special moments, AURA shops for a better you.">
          <div className="row wrap" style={{ gap: 18, marginTop: 18 }}>
            {['Price comparison', 'Best deals', 'Auto reorder', 'Personalized recommendations'].map((f) => <span key={f} className="row" style={{ gap: 7, fontSize: 14 }}><CheckCircle2 size={20} className="c-blue" /> {f}</span>)}
          </div>
        </PageHero>

        <div className="row" style={{ gap: 8 }}>
          {catStart > 0 && <button className="icon-btn" aria-label="Previous categories" onClick={() => setCatStart((s) => Math.max(0, s - 3))}><ChevronLeft size={18} /></button>}
          <div className="tabs" style={{ flex: 1 }} role="tablist" aria-label="Product categories">
            {visibleCats.map((c) => (
              <button key={c.label} role="tab" aria-selected={cat === c.label} className={`chip ${cat === c.label ? 'active' : ''}`} onClick={() => setCat(c.label)} style={{ flexDirection: 'column', minWidth: 92, flex: 1, padding: '10px 6px', gap: 6 }}>
                <c.icon size={22} style={{ color: toneHex[c.tone] }} /> <span style={{ fontSize: 12 }}>{c.label}</span>
              </button>
            ))}
          </div>
          <button className="icon-btn" aria-label="More categories" onClick={() => setCatStart((s) => (s + 10 >= categories.length ? 0 : s + 3))}><ChevronRight size={18} /></button>
        </div>

        <Hud corners>
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 className="section-title">{cat === 'All' ? 'Recommended for You' : cat}{q && <span className="t-sub" style={{ fontSize: 14 }}> · “{q}”</span>}</h2>
            {list.length > 5 && <button className="link c-blue row" style={{ background: 'none', border: 0 }} onClick={() => setAll((a) => !a)}>{all ? 'Show less' : 'See All'} <ArrowRight size={15} /></button>}
          </div>
          <div className="grid g5" style={{ gap: 12 }}>
            {shown.map((p) => (
              <ProductCard key={p.id} p={p} liked={wish.includes(p.id)} inCart={cart[p.id] ?? 0}
                onLike={() => { wishlistStore.set((w) => (w.includes(p.id) ? w.filter((x) => x !== p.id) : [...w, p.id])); toast(wish.includes(p.id) ? 'Removed from wishlist.' : `${p.name} saved to wishlist.`); }}
                onAdd={() => { addToCart(p.id); toast(`${p.name} added to Smart Cart.`); }} />
            ))}
          </div>
          {!shown.length && <div className="empty">No products match. Try another category or ask AURA.</div>}
          <div style={{ marginTop: 10 }}><DemoFlag label="DEMO CATALOGUE — AURA hands off to providers; it is not a marketplace" /></div>
        </Hud>

        <Hud corners>
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 className="section-title">Reorder &amp; Subscriptions</h2>
            <span className="t-sub">{subs.filter((s) => s.active).length} active</span>
          </div>
          <div className="grid g4" style={{ gap: 12 }}>
            {subs.map((s) => (
              <div key={s.id} className="tile row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span className="media" style={{ width: 58, height: 58, flexShrink: 0 }}><img src={s.image} alt="" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row between"><b style={{ fontSize: 14.5 }}>{s.name}</b><Toggle on={s.active} onChange={(v) => { subscriptionsStore.set((xs) => xs.map((x) => (x.id === s.id ? { ...x, active: v } : x))); toast(`${s.name} reorder ${v ? 'resumed' : 'paused'}.`); }} label={`Auto-reorder ${s.name}`} /></div>
                  <div className="t-sub">{s.every}</div>
                  <div className="row t-sub" style={{ fontSize: 12, marginTop: 4, gap: 5 }}><CalendarDays size={13} /> {s.active ? `Next: ${s.next}` : 'Paused'}</div>
                </div>
              </div>
            ))}
          </div>
        </Hud>
      </div>

      <div className="rail">
        <AICommandPanel title="Need something?" badge={null} icon={Store} header={<p className="t-sub" style={{ marginTop: -6, marginBottom: 10 }}>Just tell me…</p>}
          prompts={['Buy protein powder', 'Order my monthly groceries', 'Find a laptop under 60k', 'Reorder my face wash']} promptStyle="bullets"
          onAsk={ai} cta="Tell AURA to shop" ctaIcon={Mic} placeholder="What do you need?" />

        <Hud corners>
          <div className="row between" style={{ marginBottom: 6 }}>
            <h3 className="row" style={{ fontSize: 17 }}><ShoppingCart size={18} className="c-cyan" /> Smart Cart <span className="tag blue" style={{ borderRadius: 12 }}>{count}</span></h3>
            {lines.length > 0 && <button className="link c-blue" style={{ background: 'none', border: 0, fontSize: 12.5 }} onClick={() => { cartStore.set({}); toast('Cart cleared.'); }}>Clear</button>}
          </div>
          <div className="list">
            {lines.map(({ p, n }) => <CartLine key={p.id} p={p} qty={n} onDec={() => setQty(p.id, -1)} onInc={() => setQty(p.id, 1)} onRemove={() => cartStore.set((c) => ({ ...c, [p.id]: 0 }))} />)}
            {!lines.length && <div className="empty">Your cart is empty.</div>}
          </div>
          <div className="row between" style={{ margin: '12px 0' }}><span>Total ({count} items)</span><b style={{ fontSize: 22 }}>{inr(total)}</b></div>
          <NeonButton variant="ai" block disabled={!lines.length} onClick={() => setCheckout(true)}>Proceed to Buy <ArrowRight size={16} /></NeonButton>
        </Hud>

        <Hud corners title="Deals for You" action="See All" onAction={() => { setCat('Electronics'); setAll(true); }}>
          <div className="tile row" style={{ padding: 0, overflow: 'hidden', ['--fill' as string]: 'linear-gradient(120deg, #ea580c, #db2777)', ['--bd' as string]: '#f59e0b' }}>
            <div style={{ padding: 14, flex: 1 }}>
              <b style={{ fontSize: 19, lineHeight: 1.15, display: 'block' }}>Great Indian Festival</b>
              <span style={{ fontSize: 13 }}>Up to 70% Off</span>
              <NeonButton size="sm" style={{ marginTop: 10 }} onClick={() => { setCat('Electronics'); setAll(true); }}>Explore Deals</NeonButton>
            </div>
            <img src="/aura/p/deal-headphones.jpg" alt="" style={{ width: 110, alignSelf: 'stretch', objectFit: 'cover' }} />
          </div>
        </Hud>
      </div>

      {checkout && (
        <FuturisticModal title="Review & hand off" icon={ShieldCheck} tone="amber" onClose={() => setCheckout(false)}>
          <p className="t-sub" style={{ marginBottom: 12 }}>AURA doesn't sell products. It prepares a cart with each provider and opens their checkout for you to pay.</p>
          {Object.entries(byProvider).map(([prov, ls]) => (
            <div key={prov} className="tile" style={{ marginBottom: 8 }}>
              <div className="row between"><b>{prov}</b><span className="mono">{inr(ls.reduce((s, l) => s + l.p.price * l.n, 0))}</span></div>
              {ls.map((l) => <div key={l.p.id} className="t-sub" style={{ fontSize: 13 }}>{l.n} × {l.p.name}</div>)}
            </div>
          ))}
          <div className="row between" style={{ margin: '10px 0 16px' }}><b>Total</b><b className="c-cyan" style={{ fontSize: 20 }}>{inr(total)}</b></div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <NeonButton onClick={() => setCheckout(false)}>Cancel</NeonButton>
            <NeonButton variant="primary" icon={BadgeCheck} onClick={() => { setCheckout(false); toast(`Demo: ${Object.keys(byProvider).length} provider hand-offs prepared. Nothing was purchased — no provider is connected.`); }}>Confirm hand-off</NeonButton>
          </div>
        </FuturisticModal>
      )}
    </div>
  );
}
