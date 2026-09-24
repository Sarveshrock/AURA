import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronRight, ChevronLeft, Heart, Star, Sparkles, Rocket, Crown, CreditCard, Link2, Clock3, UsersRound, MessageSquare } from 'lucide-react';
import { Hud, NeonButton, Drawer, DemoFlag, toneHex } from '../components/aura';
import { AICommandPanel } from '../components/ai';
import { mockFaqs, mockTestimonials } from '../data/mockTestimonials';
import { usePageSearch, matches } from '../state/search';

function answerFor(q: string) {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const best = mockFaqs.map((f) => ({ f, s: words.filter((w) => (f.q + f.a).toLowerCase().includes(w)).length })).sort((a, b) => b.s - a.s)[0];
  return best.s > 0 ? `${best.f.a}` : "I don't have a saved answer for that yet — I've sent it to AI Chat where I can reason about it with your context.";
}

export default function Qa() {
  const nav = useNavigate();
  const q = usePageSearch();
  const [open, setOpen] = useState<number | null>(0);
  const [start, setStart] = useState(0);
  const [perView, setPerView] = useState(4);
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    const fit = () => setPerView(window.innerWidth < 700 ? 1 : window.innerWidth < 1200 ? 2 : 4);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const faqs = mockFaqs.map((f, i) => ({ ...f, i })).filter((f) => matches(q, f.q, f.a));
  const n = mockTestimonials.length;
  const visible = Array.from({ length: Math.min(perView, n) }, (_, k) => mockTestimonials[(start + k) % n]);

  return (
    <>
      <section className="hero" style={{ minHeight: 400, alignItems: 'stretch', padding: 0 }} aria-labelledby="qa-title">
        <img className="hero-bg" src="/aura/hero-qa.jpg" alt="" style={{ width: '32%', left: 'auto', right: '12%', maskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 80%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 80%, transparent)' }} />
        <div style={{ flex: '1 1 540px', padding: '26px 30px', maxWidth: 580 }}>
          <h1 id="qa-title" style={{ fontSize: 'clamp(34px, 3.6vw, 52px)' }}>Q&amp;A / <span className="grad">Ask Anything</span></h1>
          <p style={{ fontSize: 22, color: '#d9ecff', margin: '6px 0 18px' }}>Still have questions? We're here to help.</p>
          <div className="stack" style={{ gap: 10 }}>
            {faqs.map((f) => (
              <div key={f.q} className="tile" style={{ padding: 0 }}>
                <button className="row" style={{ width: '100%', background: 'none', border: 0, padding: '11px 14px', textAlign: 'left', gap: 12 }} onClick={() => setOpen(open === f.i ? null : f.i)} aria-expanded={open === f.i} aria-controls={`faq-${f.i}`}>
                  <HelpCircle size={20} className="c-blue" /> <span style={{ flex: 1, fontSize: 15 }}>{f.q}</span>
                  <ChevronRight size={18} style={{ transform: open === f.i ? 'rotate(90deg)' : 'none', transition: 'transform var(--t-fast)' }} />
                </button>
                {open === f.i && <p id={`faq-${f.i}`} className="t-sub fade-in" style={{ padding: '0 16px 14px 46px', fontSize: 14, lineHeight: 1.6 }}>{f.a}</p>}
              </div>
            ))}
            {faqs.length === 0 && <div className="tile empty">No FAQ matches “{q}”. <button className="c-cyan" style={{ background: 'none', border: 0 }} onClick={() => setAsk(true)}>Ask AURA instead</button></div>}
          </div>
        </div>
        <div style={{ position: 'relative', flex: '1 1 380px', minHeight: 300 }}>
          <div className="qa-orb" aria-hidden>?</div>
          <button className="ask-bubble" onClick={() => setAsk(true)}><Sparkles size={22} className="c-blue" /> Ask me<br />anything…</button>
        </div>
        <div className="hero-quote hide-sm" style={{ alignSelf: 'center', padding: '0 30px', fontSize: 28, lineHeight: 1.3, maxWidth: 260 }}>“Curiosity Today. A Smarter Tomorrow.”<small style={{ fontSize: 20, color: '#8fd3ff' }}>— AURA</small></div>
      </section>

      <Hud corners glow="violet">
        <div className="row between wrap" style={{ marginBottom: 16 }}>
          <h2 className="row" style={{ fontSize: 24 }}><Heart size={26} className="c-violet" style={{ filter: 'drop-shadow(0 0 6px var(--aura-purple))' }} /> What Our Users Say</h2>
          <div className="row">
            <span className="t-sub hide-sm">Real people. Real impact.</span>
            <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setStart((s) => (s - 1 + n) % n)} aria-label="Previous testimonial"><ChevronLeft size={16} /></button>
            <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setStart((s) => (s + 1) % n)} aria-label="Next testimonial"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0,1fr))` }} aria-live="polite">
          {visible.map((t) => (
            <figure key={t.id} className="tile row fade-in" style={{ margin: 0, alignItems: 'flex-start', gap: 16, padding: 18, ['--bd' as string]: `${toneHex[t.tone]}aa` }}>
              <img src={t.avatar} alt="" style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${toneHex[t.tone]}`, objectFit: 'cover', flexShrink: 0 }} />
              <div className="stack" style={{ gap: 10 }}>
                <blockquote style={{ margin: 0, fontSize: 15.5, lineHeight: 1.45 }}>“{t.quote}”</blockquote>
                <figcaption className="row" style={{ gap: 10 }}>
                  <span className="stars" aria-label="5 out of 5 stars">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={15} fill="currentColor" />)}</span>
                  <span><b style={{ fontSize: 13 }}>{t.name}</b><br /><span className="t-mute">{t.role}</span></span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
        <div style={{ marginTop: 10 }}><DemoFlag label="SAMPLE TESTIMONIALS" /></div>
      </Hud>

      <Hud corners style={{ ['--fill' as string]: 'linear-gradient(180deg, rgba(6,14,32,0.2), rgba(4,10,22,0.95) 70%), radial-gradient(80% 90% at 70% 110%, rgba(139,92,255,0.45), transparent 70%), linear-gradient(90deg, #050d1b, #0c1638)' }}>
        <div className="row between wrap" style={{ gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 32 }}>Ready to Experience <span className="grad">AURA?</span></h2>
            <p className="t-sub" style={{ fontSize: 16, marginTop: 6, maxWidth: 440 }}>Join thousands of users building a more productive, organized, and balanced life with AI.</p>
          </div>
          <div className="row wrap">
            <NeonButton variant="ai" size="lg" icon={Rocket} onClick={() => nav('/signup')}>Get Started for Free →</NeonButton>
            <NeonButton size="lg" onClick={() => nav('/pricing')} style={{ ['--bd' as string]: 'var(--aura-warning)', minWidth: 240 }}><Crown size={20} className="c-amber" /> Upgrade to Pro</NeonButton>
          </div>
        </div>
        <div className="row wrap t-sub" style={{ marginTop: 18, gap: 28, justifyContent: 'space-between' }}>
          <span className="row"><CreditCard size={18} /> No credit card required</span>
          <span className="row"><Link2 size={18} /> Connect your favorite apps</span>
          <span className="row"><Clock3 size={18} /> Set up in minutes</span>
          <span className="row"><UsersRound size={18} /> Join a growing community</span>
        </div>
      </Hud>

      <Drawer title="Ask AURA" icon={MessageSquare} open={ask} onClose={() => setAsk(false)}>
        <AICommandPanel
          title="Ask me anything" initialOpen prompts={mockFaqs.slice(0, 4).map((f) => f.q)} placeholder="Type your question…"
          onAsk={(p) => {
            const a = answerFor(p);
            const known = !a.startsWith("I don't");
            return known ? { text: a } : { text: a, actions: [{ label: 'Open in AI Chat', variant: 'primary', run: () => { nav(`/chat?q=${encodeURIComponent(p)}`); } }] };
          }}
        />
      </Drawer>
    </>
  );
}
