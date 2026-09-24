import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, FileText, Scale, Sun, Play, Radar, CalendarDays, MapPin, IndianRupee, Crosshair, Briefcase, Plane, Car, Building2,
  Train, CheckCircle2, MinusCircle, SlidersHorizontal, Bookmark, MessageSquare, X, Info, Clock, Armchair, ShieldAlert, GripVertical,
} from 'lucide-react';
import { Hud, IconBox, Ring, DemoFlag, NeonButton, NeonTabs, Bar, StatusBadge, toast, toneHex, type Tone } from '../components/aura';
import ApprovalModal from '../components/ApprovalModal';
import { agentById, user } from '../data/mock';

interface Option {
  id: number;
  title: string;
  desc: string;
  items: [typeof Plane, string, number][];
  pros: string[];
  cons: string[];
  tone: Tone;
  /** attributes used by the scoring model (0–1, higher is better) */
  attrs: { cost: number; prep: number; comfort: number; meeting: number; risk: number };
  time: string;
}

const options: Option[] = [
  { id: 1, title: 'Flight (Morning) + Prep Plan', desc: 'Fastest and most convenient option with enough prep time.', items: [[Plane, 'Flight (IndiGo)', 3200], [Car, 'Cab (Bangalore)', 600], [Building2, 'Stay (1 night)', 1200]], pros: ['Reach on time', 'More rest before interview', 'Good preparation time'], cons: ['Higher cost'], tone: 'green', attrs: { cost: 0.45, prep: 0.9, comfort: 0.9, meeting: 0.6, risk: 0.85 }, time: '1h 15m' },
  { id: 2, title: 'Train (Overnight) + Budget Plan', desc: 'Most budget-friendly option with reasonable comfort.', items: [[Train, 'Train (Sleeper)', 800], [Car, 'Local Transport', 400], [Building2, 'Stay (1 night)', 1200]], pros: ['Very budget-friendly', 'Save travel cost', 'Reach early morning'], cons: ['Longer travel time', 'Less rest time'], tone: 'blue', attrs: { cost: 0.95, prep: 0.55, comfort: 0.45, meeting: 0.3, risk: 0.7 }, time: '14h 30m' },
  { id: 3, title: 'Reschedule Meeting + Day Travel', desc: "Keep today's meeting, travel tomorrow morning.", items: [[Plane, 'Flight (Late Morning)', 2800], [Car, 'Cab (Bangalore)', 600], [Building2, 'Stay (1 night)', 1200]], pros: ["Attend today's meeting", 'Balanced cost and time', 'Comfortable travel'], cons: ['Less preparation time', 'Risk of delays'], tone: 'amber', attrs: { cost: 0.6, prep: 0.4, comfort: 0.75, meeting: 1, risk: 0.45 }, time: '1h 20m' },
];

const goalAttr: Record<string, (keyof Option['attrs'])[]> = {
  'Attend interview successfully': ['prep', 'risk'],
  'Stay within budget': ['cost'],
  "Manage today's work meeting": ['meeting'],
  'Travel comfortably': ['comfort'],
  'Be well prepared': ['prep'],
};

const stages = [['Analyze', Brain], ['Plan', FileText], ['Compare', Scale], ['Recommend', Sun], ['Execute', Play]] as const;
const goalTone = ['#FFC857', '#00AFFF', '#00E5A8', '#19E6FF', '#FF4FD8'];

function Meter({ label, value, icon: I }: { label: string; value: number; icon: typeof Clock }) {
  return (
    <div className="row" style={{ fontSize: 12 }}>
      <I size={13} className="t-mute" />
      <span style={{ width: 78 }} className="t-sub">{label}</span>
      <div style={{ flex: 1 }}><Bar value={value * 100} tone={value > 0.7 ? 'green' : value > 0.5 ? 'cyan' : 'amber'} /></div>
    </div>
  );
}

export default function Decisions() {
  const nav = useNavigate();
  const [chosen, setChosen] = useState<number | null>(null);
  const [view, setView] = useState<'All Options (3)' | "AURA's Pick" | 'Custom Plan'>('All Options (3)');
  const [approve, setApprove] = useState(false);
  const [goals, setGoals] = useState(Object.keys(goalAttr));

  // Weighted score: higher-priority goals weigh more (5..1). Transparent + deterministic.
  const scores = useMemo(() => {
    const out: Record<number, number> = {};
    for (const o of options) {
      let s = 0, w = 0;
      goals.forEach((g, i) => {
        const weight = goals.length - i;
        for (const a of goalAttr[g]) { s += o.attrs[a] * weight; w += weight; }
      });
      out[o.id] = s / w;
    }
    return out;
  }, [goals]);
  const pick = options.reduce((a, b) => (scores[a.id] >= scores[b.id] ? a : b));
  const confidence = Math.round(60 + (scores[pick.id] - Math.max(...options.filter((o) => o.id !== pick.id).map((o) => scores[o.id]))) * 300);
  const shown = view === "AURA's Pick" ? [pick] : options;
  const sel = options.find((o) => o.id === chosen);

  const move = (from: number, to: number) => setGoals((gs) => { const c = [...gs]; const [m] = c.splice(from, 1); c.splice(to, 0, m); return c; });

  return (
    <>
      <div className="tabs" aria-label="Decision stage">
        {stages.map(([l, I], i) => {
          const cur = chosen ? 3 : 2;
          return (
            <div key={l} className={`chip ${i === 0 ? 'active' : ''}`} style={{ flex: 1, flexDirection: 'column', padding: 12, minWidth: 96, opacity: i <= cur ? 1 : 0.55, fontSize: 14 }} aria-current={i === 0 ? 'step' : undefined}>
              <I size={24} /> {l}
            </div>
          );
        })}
      </div>

      <div className="hero" style={{ minHeight: 220 }}>
        <img className="hero-bg" src="/aura/decision-android.jpg" alt="" style={{ width: '52%' }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 'clamp(34px, 4vw, 52px)' }}>Decision Center</h1>
          <p style={{ fontSize: 20, color: 'var(--aura-text-2)', marginTop: 4 }}>From complexity to clarity.</p>
          <p className="lead" style={{ fontSize: 14.5 }}>AURA analyzes your situation, evaluates multiple options, and helps you choose the best path forward.</p>
        </div>
        <div className="hero-quote hide-sm" style={{ fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', maxWidth: 170, alignSelf: 'center', marginRight: '40%' }}>“I analyze options, you make bigger moves.”</div>
      </div>

      <div className="grid auto-stack" style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)' }}>
        <Hud corners title="Current Situation" icon={Radar} action={<span className="row"><span className="dot cyan pulse" /> Live Context</span>}>
          <div className="row" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
            <div className="avatar" style={{ width: 52, height: 52 }}>{user.initials}</div>
            <div className="tile" style={{ flex: 1, fontSize: 16, padding: '14px 18px' }}>I have an interview tomorrow in Bangalore. Help me plan everything considering my budget and work meeting today.</div>
          </div>
          <div className="grid g5" style={{ gap: 8 }}>
            {[[CalendarDays, 'Interview', 'Tomorrow 10:00 AM'], [MapPin, 'Location', 'Bangalore'], [IndianRupee, 'Budget', '~ ₹5,000'], [Crosshair, 'Current Location', 'Pune'], [Briefcase, 'Work Meeting', 'Today 4:00 PM']].map(([I, k, v]) => {
              const Ic = I as typeof Plane;
              return <div className="tile" key={k as string}><Ic size={20} className="c-cyan" /><div className="t-sub" style={{ marginTop: 8 }}>{k as string}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v as string}</div></div>;
            })}
          </div>
        </Hud>
        <Hud corners title="Priority Goals" action="Drag to reorder">
          <ol className="stack" style={{ gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
            {goals.map((g, i) => (
              <li key={g} className="tile row" draggable onDragStart={(e) => e.dataTransfer.setData('i', String(i))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => move(Number(e.dataTransfer.getData('i')), i)} style={{ cursor: 'grab', padding: 9 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `1.5px solid ${goalTone[i]}`, color: goalTone[i], boxShadow: `0 0 8px ${goalTone[i]}66`, fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, flex: 1 }}>{g}</span>
                <span className="row" style={{ gap: 2 }}>
                  <button className="icon-btn bare" style={{ width: 22, height: 22 }} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${g} up`}>▲</button>
                  <button className="icon-btn bare" style={{ width: 22, height: 22 }} disabled={i === goals.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${g} down`}>▼</button>
                </span>
                <GripVertical size={14} className="t-mute hide-sm" />
              </li>
            ))}
          </ol>
        </Hud>
      </div>

      <Hud corners title="Agents at Work" icon={Brain} sub="Multiple AI agents are analyzing your situation in parallel…" action="View Details" onAction={() => nav('/collaboration')}>
        <div className="grid g5" style={{ gap: 10 }}>
          {[['travel', 'Finding best travel options', 'active'], ['finance', 'Checking budget constraints', 'processing'], ['productivity', 'Analyzing schedule conflicts', 'active'], ['research', 'Preparing interview guide', 'processing'], ['communication', 'Drafting messages (if needed)', 'active']].map(([id, t, st]) => {
            const a = agentById(id)!;
            return (
              <div className="tile" key={id}>
                <div className="row between"><IconBox icon={a.icon} tone={a.tone} size="lg" round /><StatusBadge status={st as 'active'} label="" /></div>
                <div className="t-title" style={{ marginTop: 10 }}>{a.name}</div>
                <div className="t-sub">{t}</div>
              </div>
            );
          })}
        </div>
      </Hud>

      <Hud corners title="Options & Recommendations" icon={Scale}>
        <div className="row between wrap" style={{ marginBottom: 14, marginTop: -4 }}>
          <DemoFlag label="DEMO FARES" />
          <NeonTabs tabs={['All Options (3)', "AURA's Pick", 'Custom Plan'] as const} value={view} onChange={(v) => (v === 'Custom Plan' ? nav('/chat?q=Build%20a%20custom%20interview%20travel%20plan') : setView(v))} />
        </div>
        <div className="grid g3">
          {shown.map((o) => {
            const total = o.items.reduce((s, x) => s + x[2], 0);
            const on = chosen === o.id;
            const isPick = o.id === pick.id;
            return (
              <div key={o.id} className="hud" style={{ padding: 16, ['--bd' as string]: on ? toneHex[o.tone] : `${toneHex[o.tone]}66`, filter: on ? `drop-shadow(0 0 16px ${toneHex[o.tone]}99)` : undefined }}>
                <div className="row between">
                  {isPick ? <span className="tag green" title="Highest weighted score for your current goal order">AURA's pick · {Math.round(scores[o.id] * 100)}</span> : <span className="t-mute mono">score {Math.round(scores[o.id] * 100)}</span>}
                  <span style={{ fontSize: 13, color: toneHex[o.tone] }}>Option {o.id}</span>
                </div>
                <div className="t-title" style={{ fontSize: 17, marginTop: 10 }}>{o.title}</div>
                <div className="t-sub" style={{ marginBottom: 10 }}>{o.desc}</div>
                <div className="list">
                  {o.items.map(([I, l, p]) => <div className="li" key={l} style={{ padding: '6px 0' }}><I size={15} className="t-mute" /><span className="grow" style={{ fontSize: 13 }}>{l}</span><span className="mono" style={{ fontSize: 13 }}>₹{p.toLocaleString('en-IN')}</span></div>)}
                  <div className="li"><span className="grow">Total Estimated Cost</span><b style={{ fontSize: 20, color: toneHex[o.tone] }}>₹{total.toLocaleString('en-IN')}</b></div>
                </div>
                <div className="stack" style={{ gap: 6, margin: '8px 0' }}>
                  <Meter label={`Time · ${o.time}`} value={o.attrs.prep} icon={Clock} />
                  <Meter label="Convenience" value={o.attrs.comfort} icon={Armchair} />
                  <Meter label="Low risk" value={o.attrs.risk} icon={ShieldAlert} />
                </div>
                <div className="c-green" style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>Pros</div>
                {o.pros.map((p) => <div key={p} className="row" style={{ fontSize: 12.5, padding: '2px 0' }}><CheckCircle2 size={14} className="c-green" /> {p}</div>)}
                <div className="c-red" style={{ fontSize: 13, marginTop: 6, fontWeight: 600 }}>Cons</div>
                {o.cons.map((p) => <div key={p} className="row" style={{ fontSize: 12.5, padding: '2px 0' }}><MinusCircle size={14} className="c-red" /> {p}</div>)}
                <NeonButton block variant={on ? 'primary' : 'default'} style={{ marginTop: 14 }} onClick={() => setChosen(on ? null : o.id)} aria-pressed={on}>{on ? 'Selected ✓' : 'Select This Option'}</NeonButton>
              </div>
            );
          })}
        </div>
      </Hud>

      <Hud corners>
        <div className="row wrap" style={{ gap: 20, alignItems: 'flex-start' }}>
          <span className="icon-box lg round c-cyan" style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>A</span>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="t-title" style={{ fontSize: 17 }}>AURA's Analysis</div>
            <p className="t-sub" style={{ fontSize: 14.5, marginTop: 6, lineHeight: 1.6 }}>
              Weighing your goals in the order you set, <b style={{ color: '#fff' }}>Option {pick.id}</b> scores highest. {pick.id === 1 ? 'It gives the best balance of timing, comfort, and preparation time.' : pick.id === 2 ? 'It keeps you well within budget at the cost of rest time.' : "It protects today's meeting but compresses preparation."} The final choice is yours.
            </p>
            <div className="row t-mute" style={{ marginTop: 8 }}><Info size={12} /> Assumptions: fares as of 10:12 AM; no weather delays. Uncertainty: prices may change before booking.</div>
          </div>
          <div className="row" style={{ gap: 18 }}>
            <div className="stack" style={{ alignItems: 'center', gap: 6 }}><span className="t-sub">Confidence Score</span><Ring value={Math.max(55, Math.min(97, confidence))} size={104} /></div>
            <div className="stack" style={{ gap: 7 }}>
              {['Time feasibility', 'Budget alignment', 'Low risk of delays', 'Better preparation time'].map((f) => <span key={f} className="row" style={{ fontSize: 13 }}><CheckCircle2 size={15} className="c-green" /> {f}</span>)}
            </div>
          </div>
        </div>
        <div className="row wrap" style={{ marginTop: 18, justifyContent: 'space-between', gap: 12 }}>
          <div className="row wrap">
            <NeonButton icon={SlidersHorizontal} onClick={() => nav('/chat?q=Modify%20my%20interview%20plan')}>Modify Plan</NeonButton>
            <NeonButton icon={MessageSquare} onClick={() => nav(`/chat?q=${encodeURIComponent(`Explain the trade-offs of option ${chosen ?? pick.id}`)}`)}>Ask AURA</NeonButton>
            <NeonButton variant="danger" icon={X} onClick={() => { setChosen(null); toast('Plan rejected. AURA will not act on it.'); }}>Reject</NeonButton>
          </div>
          <div className="row wrap">
            <NeonButton variant="primary" size="lg" hex chevron disabled={!sel} onClick={() => setApprove(true)} title={sel ? undefined : 'Select an option first'}>Proceed with Selected Plan</NeonButton>
            <NeonButton icon={Bookmark} onClick={() => toast('Saved for later in Decisions.')}>Save for Later</NeonButton>
          </div>
        </div>
      </Hud>

      {approve && sel && (
        <ApprovalModal
          action={`Execute Option ${sel.id}: ${sel.title}`}
          details={[...sel.items.map(([, l, p]) => `${l} — ₹${p.toLocaleString('en-IN')}`), 'Decision ID: DEC-2025-1014-007']}
          onClose={() => setApprove(false)}
        />
      )}
    </>
  );
}
