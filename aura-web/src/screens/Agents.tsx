import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Workflow, Cpu, MessageSquare, MoreHorizontal, Activity, CheckCircle2, ChevronLeft, Target, Clock3, IndianRupee,
  ListChecks, MessageCircle, Lightbulb, Timer, Network, CalendarDays, Plane, BedDouble, Map, FileText, Bus, Sparkles,
  Hotel, Receipt, Route, BadgeCheck, TrendingUp, Landmark, Search, Scale, CalendarCheck, ArrowRight, ChevronDown,
} from 'lucide-react';
import {
  Hud, IconBox, Bar, Ring, DemoFlag, AgentNetwork, AgentAvatar, AppLogo, BarChart, Toggle, NeonButton, NeonTabs, StatusBadge,
  toast, toneHex, type StatusKind, type Tone,
} from '../components/aura';
import { agents, agentById, activityFeed, type Agent } from '../data/mock';

const permissionTone = { Suggest: 'cyan', Prepare: 'blue', 'Restricted Execute': 'amber', 'Explicit Approval': 'red' } as const;
const hubAgents = () => agents.filter((a) => !['core', 'calendar'].includes(a.id));

/* =================== AGENT HUB (ref 09) =================== */

const activeTasks: { t: string; v: number; tone: Tone; agent: string }[] = [
  { t: 'Finding best flight options to Bangalore', v: 80, tone: 'cyan', agent: 'travel' },
  { t: 'Analyzing your interview schedule', v: 60, tone: 'teal', agent: 'productivity' },
  { t: 'Checking budget constraints', v: 45, tone: 'violet', agent: 'finance' },
  { t: 'Preparing travel itinerary', v: 30, tone: 'amber', agent: 'travel' },
];

function SelectedAgent({ a }: { a: Agent }) {
  const nav = useNavigate();
  const [tab, setTab] = useState<'Overview' | 'Capabilities' | 'Integrations'>('Overview');
  return (
    <Hud corners title="Selected Agent" icon={Workflow}>
      <div className="tile row" style={{ gap: 14, padding: 10, alignItems: 'stretch' }}>
        <div className="hud-frame" style={{ width: 120, height: 124, flexShrink: 0 }}><img src="/aura/travel-android.jpg" alt="" style={{ filter: `hue-rotate(${a.tone === 'blue' ? 0 : 0}deg)` }} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between"><span className="row"><IconBox icon={a.icon} tone={a.tone} size="sm" /><span className="t-title" style={{ fontSize: 17 }}>{a.name}</span></span></div>
          <StatusBadge status={a.status as StatusKind} />
          <div className="t-sub" style={{ margin: '4px 0 10px' }}>{a.purpose}</div>
          <div className="row">
            <NeonButton size="sm" variant="primary" icon={MessageSquare} onClick={() => nav(`/chat?q=${encodeURIComponent(`${a.name}: what are you working on?`)}`)}>Chat with Agent</NeonButton>
            <button className="icon-btn" style={{ width: 34, height: 34 }} aria-label="Open agent details" onClick={() => nav(`/agents/${a.id}`)}><MoreHorizontal size={16} /></button>
          </div>
        </div>
      </div>
      <div style={{ margin: '14px 0 10px' }}><NeonTabs tabs={['Overview', 'Capabilities', 'Integrations'] as const} value={tab} onChange={setTab} stretch /></div>
      {tab === 'Overview' && (
        <>
          <div className="t-title" style={{ fontSize: 16, marginBottom: 4 }}>About</div>
          <p className="t-sub" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{a.purpose}. Current task: {a.task}.</p>
          <div className="row between" style={{ marginTop: 10 }}><span className="t-sub">Permission level</span><span className={`tag ${permissionTone[a.permission]}`}>{a.permission}</span></div>
        </>
      )}
      {tab === 'Capabilities' && <div className="row wrap">{a.capabilities.map((c) => <span key={c} className="tag blue">{c}</span>)}</div>}
      <div className="t-title" style={{ fontSize: 16, margin: '14px 0 10px' }}>Connected Apps</div>
      <div className="row wrap" style={{ gap: 14 }}>
        {a.tools.slice(0, 5).map((t) => <div key={t} className="stack" style={{ alignItems: 'center', gap: 5 }}><AppLogo name={t} size={38} /><span style={{ fontSize: 11 }}>{t}</span></div>)}
        {tab === 'Integrations' && <span className="t-mute">Scopes are managed in Integrations.</span>}
      </div>
    </Hud>
  );
}

export function AgentHub() {
  const nav = useNavigate();
  const [sel, setSel] = useState('travel');
  const a = agentById(sel)!;
  const list = hubAgents();

  return (
    <>
      <div className="with-rail" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
        <Hud corners style={{ paddingBottom: 8 }}>
          <div className="row between wrap" style={{ alignItems: 'flex-start', gap: 12 }}>
            <div style={{ maxWidth: 540 }}>
              <h1 style={{ fontSize: 40 }}>Agent Hub</h1>
              <p style={{ fontSize: 18, marginTop: 2 }}>A Team of Specialized AI Agents Working for You</p>
              <p className="t-sub" style={{ marginTop: 8, fontSize: 14 }}>AURA coordinates multiple intelligent agents to understand your needs, collaborate, and take action across your apps and life.</p>
            </div>
            <div className="row wrap" style={{ alignItems: 'flex-start' }}>
              <NeonButton size="sm" icon={Plus} onClick={() => toast('Custom agent builder: define role, tools and permission scope.')}>Add Custom Agent</NeonButton>
              <div className="stack" style={{ gap: 8 }}>
                <div className="tile row" style={{ padding: '8px 14px' }}><IconBox icon={Workflow} tone="blue" size="sm" round /><div><b style={{ fontSize: 22 }}>{list.length}</b><div className="hud-label" style={{ color: 'var(--aura-text-2)', fontSize: 9 }}>Active agents</div></div></div>
                <div className="tile row" style={{ padding: '8px 14px' }}><IconBox icon={Cpu} tone="violet" size="sm" round /><div><b style={{ fontSize: 22 }}>24</b><div className="hud-label" style={{ color: 'var(--aura-text-2)', fontSize: 9 }}>Tasks running</div></div></div>
              </div>
            </div>
          </div>
          <AgentNetwork agents={list} selected={sel} onSelect={setSel} coreLabel={`Coordinates ${list.length} agents in real-time`} />
        </Hud>
        <div className="stack">
          <SelectedAgent a={a} />
          <Hud corners title="Recent Activity" action="View All" onAction={() => nav(`/agents/${a.id}`)}>
            <div className="list">
              {[[Plane, 'Found best flight to Bangalore', '09:12'], [BedDouble, 'Compared hotel options', '09:10'], [Map, 'Created travel itinerary', '09:08'], [CalendarDays, 'Added to your calendar', '09:07']].map(([I, t, tm]) => {
                const Ic = I as typeof Plane;
                return <div className="li" key={t as string}><Ic size={16} className="c-cyan" /><span className="grow" style={{ fontSize: 13 }}>{t as string}</span><span className="t-mute mono">{tm as string} AM</span><StatusBadge status="completed" label="Completed" pulse={false} /></div>;
              })}
            </div>
          </Hud>
        </div>
      </div>

      <div className="grid auto-stack" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 380px' }}>
        <Hud corners title="Agent Collaboration" icon={Network}>
          <div className="row wrap" style={{ gap: 10, padding: '6px 0', position: 'relative' }}>
            <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 40, transform: 'translateY(-50%)', border: '1px solid rgba(0,175,255,0.3)', borderRadius: '50%' }} />
            {list.map((g) => (
              <button key={g.id} onClick={() => setSel(g.id)} aria-label={`Select ${g.name}`} aria-pressed={sel === g.id} style={{ background: 'none', border: 0, padding: 0, transform: sel === g.id ? 'scale(1.12)' : undefined, transition: 'transform .2s' }}>
                <IconBox icon={g.icon} tone={g.tone} round />
              </button>
            ))}
          </div>
        </Hud>
        <Hud corners title="Active Agent Tasks" icon={Activity}>
          <div className="stack" style={{ gap: 12 }}>
            {activeTasks.map((t) => {
              const ag = agentById(t.agent)!;
              return (
                <div key={t.t} className="row">
                  <ag.icon size={15} style={{ color: toneHex[t.tone] }} />
                  <span className="ellipsis" style={{ fontSize: 13, width: '48%' }}>{t.t}</span>
                  <div style={{ flex: 1 }}><Bar value={t.v} tone={t.tone} /></div>
                  <span className="mono t-sub" style={{ width: 34, textAlign: 'right' }}>{t.v}%</span>
                </div>
              );
            })}
          </div>
        </Hud>
        <Hud corners>
          <div className="row">
            <div className="stack" style={{ gap: 7, flex: 1 }}>
              <div className="row"><Activity size={16} className="c-cyan" /><b>System Status</b></div>
              <span className="c-green" style={{ fontSize: 13 }}>All Agents Operational</span>
              <div className="row between t-sub"><StatusBadge status="online" label={`${list.length} / ${list.length} Online`} /></div>
              <div className="row between t-sub"><span>Avg. Response Time</span><b style={{ color: '#fff' }}>1.2s</b></div>
              <div className="row between t-sub"><span>Tasks Completed Today</span><b style={{ color: '#fff' }}>24</b></div>
            </div>
            <Ring value={100} size={112} stroke={9} label="100%" sub="Operational" tone="teal" />
          </div>
        </Hud>
      </div>
      <DemoFlag />
    </>
  );
}

/* =================== AGENT DETAIL — e.g. Travel Agent (ref 11) =================== */

const capIcons = [Search, Hotel, Scale, Route, FileText, Sparkles];
const steps: [string, string, string][] = [
  ['Understand Your Needs', 'I analyze your destination, dates, budget, and preferences.', '#19E6FF'],
  ['Find Best Options', 'I search across multiple platforms for the best deals.', '#00E5A8'],
  ['Compare & Recommend', 'I analyze price, convenience, and your preferences.', '#8B5CFF'],
  ['Plan Complete Itinerary', 'I create a detailed day-wise plan with activities.', '#FFC857'],
  ['Book With Your Approval', 'I can book flights, hotels, and activities once you approve.', '#FF4FD8'],
];

export function AgentDetail() {
  const { id = 'travel' } = useParams();
  const nav = useNavigate();
  const a = agentById(id) ?? agentById('travel')!;
  const [enabled, setEnabled] = useState(true);
  const [autonomy, setAutonomy] = useState(a.permission === 'Explicit Approval' ? 4 : a.permission === 'Prepare' ? 2 : 1);
  const [tab, setTab] = useState<'Overview' | 'Capabilities' | 'Integrations' | 'Recent Activity' | 'Settings'>('Overview');
  const [range, setRange] = useState('Last 30 days');
  const c = toneHex[a.tone];
  const perf = useMemo(() => Array.from({ length: 18 }, (_, i) => 4 + Math.round(Math.abs(Math.sin(i * 1.7 + id.length)) * 8)), [id]);

  const currentTasks: [typeof Plane, string, string, number][] = [
    [Plane, 'Find best flight to Bangalore', 'Searching options…', 80], [BedDouble, 'Compare hotel options', 'Analyzing prices…', 60],
    [CalendarDays, 'Create travel itinerary', 'Planning activities…', 40], [FileText, 'Check visa requirements', '', 0], [Bus, 'Look for local transport options', '', 0],
  ];

  return (
    <>
      <div className="grid auto-stack" style={{ gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr) minmax(0,1fr)' }}>
        <Hud corners style={{ paddingTop: 14 }}>
          <Link to="/agents" className="btn sm" style={{ marginBottom: 10 }}><ChevronLeft size={15} /> Back to Agent Hub</Link>
          <div className="row" style={{ gap: 18, alignItems: 'stretch' }}>
            <div className="hud-frame hide-sm" style={{ width: 190, height: 170, flexShrink: 0 }}><img src="/aura/travel-android.jpg" alt="" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row wrap"><IconBox icon={a.icon} tone={a.tone} size="lg" /><h1 style={{ fontSize: 32 }}>{a.name}</h1><span className="tag green"><CheckCircle2 size={12} /> Active</span></div>
              <p style={{ margin: '8px 0', fontSize: 15 }}>{a.purpose} intelligently.</p>
              <p className="t-sub" style={{ fontSize: 13.5, lineHeight: 1.55 }}>I help you find the best options, compare prices, create personalized plans, and handle bookings — always with your approval.</p>
              <div className="row wrap" style={{ marginTop: 12 }}>
                <NeonButton variant="primary" icon={MessageSquare} onClick={() => nav(`/chat?q=${encodeURIComponent(`${a.name}: what are you working on?`)}`)}>Chat with {a.name}</NeonButton>
                <button className="icon-btn" aria-label="More actions" onClick={() => setTab('Settings')}><MoreHorizontal size={18} /></button>
              </div>
            </div>
          </div>
        </Hud>
        <Hud corners title="Key Capabilities">
          <div className="grid g2" style={{ gap: 8 }}>
            {a.capabilities.slice(0, 6).map((cap, i) => { const I = capIcons[i % capIcons.length]; return <div key={cap} className="tile row" style={{ fontSize: 13, padding: 10 }}><I size={19} style={{ color: c, flexShrink: 0 }} /> {cap}</div>; })}
          </div>
        </Hud>
        <Hud corners title="Performance" action={<span className="row">{range} <ChevronDown size={12} /></span>} onAction={() => setRange((r) => (r === 'Last 30 days' ? 'Last 7 days' : 'Last 30 days'))}>
          <div className="grid g2" style={{ gap: 8 }}>
            {[[Map, '12', 'Trips Planned'], [BadgeCheck, '8', 'Bookings Made'], [IndianRupee, '₹42,000', 'Total Saved'], [TrendingUp, '98%', 'Success Rate']].map(([I, v, l]) => {
              const Ic = I as typeof Map;
              return <div className="tile row" key={l as string} style={{ padding: 9 }}><Ic size={20} className="c-cyan" /><div><b style={{ fontSize: 18 }}>{v as string}</b><div className="t-sub" style={{ fontSize: 11.5 }}>{l as string}</div></div></div>;
            })}
          </div>
          <BarChart values={range === 'Last 30 days' ? perf : perf.slice(-7)} labels={Array(perf.length).fill('')} height={80} colors={['#00AFFF', '#19E6FF']} />
        </Hud>
      </div>

      <NeonTabs tabs={['Overview', 'Capabilities', 'Integrations', 'Recent Activity', 'Settings'] as const} value={tab} onChange={setTab} stretch />

      {tab === 'Settings' ? (
        <Hud corners title="Agent Controls" sub="Permissions are enforced by the backend policy engine, not by the model.">
          <div className="list">
            <div className="li"><span className="grow">Enable agent</span><Toggle on={enabled} onChange={setEnabled} label="Enable agent" /></div>
            <div className="li"><label className="grow" htmlFor="mem">Memory access</label><select id="mem" className="select"><option>Travel + Preferences only</option><option>All categories</option><option>None</option></select></div>
            <div className="li" style={{ flexWrap: 'wrap' }}>
              <span className="grow">Autonomy level</span>
              <div className="row wrap">
                {['Suggest', 'Prepare', 'Restricted Execute', 'Explicit Approval'].map((l, i) => (
                  <button key={l} className={`chip ${autonomy === i + 1 ? 'active' : ''}`} onClick={() => { setAutonomy(i + 1); toast(`Autonomy set to Level ${i + 1} — ${l}`); }}>L{i + 1} · {l}</button>
                ))}
              </div>
            </div>
          </div>
        </Hud>
      ) : tab === 'Capabilities' || tab === 'Integrations' ? (
        <Hud corners title={tab}>
          <div className="row wrap" style={{ gap: 10 }}>
            {(tab === 'Capabilities' ? a.capabilities : a.tools).map((x) => tab === 'Integrations'
              ? <div key={x} className="tile row"><AppLogo name={x} size={34} /><div><b>{x}</b><StatusBadge status="online" label="Connected" pulse={false} /></div></div>
              : <span key={x} className="tag blue" style={{ padding: '6px 10px', fontSize: 13 }}>{x}</span>)}
          </div>
        </Hud>
      ) : (
        <div className="grid g3">
          <Hud corners title="How I Work" icon={Target}>
            <div className="stack" style={{ gap: 14 }}>
              {steps.map(([t, s, col], i) => (
                <div className="row" key={t} style={{ alignItems: 'flex-start' }}>
                  <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `2px solid ${col}`, color: '#fff', fontWeight: 700, boxShadow: `0 0 10px ${col}88` }}>{i + 1}</span>
                  <div><div className="t-title">{t}</div><div className="t-sub">{s}</div></div>
                </div>
              ))}
            </div>
          </Hud>
          <Hud corners title="Current Tasks" icon={ListChecks} action="View All" onAction={() => nav('/tasks')}>
            <div className="stack" style={{ gap: 8 }}>
              {currentTasks.map(([I, t, s, v]) => (
                <div className="tile row" key={t}>
                  <IconBox icon={I} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}><div className="t-title" style={{ fontSize: 13.5 }}>{t}</div>{s && <div className="t-sub">{s}</div>}</div>
                  {v > 0 ? <><Ring value={v} size={30} stroke={3} label="" /><span className="mono t-sub">{v}%</span></> : <span style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid var(--aura-border-hi)' }} aria-label="Queued" />}
                </div>
              ))}
            </div>
          </Hud>
          <Hud corners title="Upcoming Trip" icon={Map} action="Edit" onAction={() => nav('/travel')}>
            <div className="hud-frame" style={{ height: 130, ['--fill' as string]: 'linear-gradient(170deg, #f59e0b, #b45309 35%, #4c1d95 70%, #0b1728)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 14 }}>
                <b style={{ fontSize: 22, textShadow: '0 2px 10px #000' }}>Bangalore, India</b>
                <Landmark size={64} strokeWidth={1} style={{ opacity: 0.55 }} />
              </div>
            </div>
            <div className="row between" style={{ margin: '12px 0' }}><span className="t-sub row"><CalendarDays size={14} /> Oct 15, 2025 – Oct 18, 2025</span><span className="tag green">Planning</span></div>
            <div className="grid g3" style={{ gap: 8 }}>
              {[[Plane, 'Flights', '3 options'], [BedDouble, 'Hotels', '5 options'], [Map, 'Activities', '12 ideas']].map(([I, t, s]) => { const Ic = I as typeof Plane; return <div className="tile" key={t as string}><Ic size={18} className="c-cyan" /><div className="t-title" style={{ fontSize: 13 }}>{t as string}</div><div className="t-sub">{s as string}</div></div>; })}
            </div>
            <NeonButton block style={{ marginTop: 12 }} onClick={() => nav('/travel')}>View Full Plan <ArrowRight size={15} /></NeonButton>
          </Hud>
        </div>
      )}

      <div className="grid g3">
        <Hud corners title="Connected Apps">
          <div className="row wrap" style={{ gap: 14 }}>
            {[...a.tools, 'Airbnb'].map((t, i) => (
              <div key={t} className="stack" style={{ alignItems: 'center', gap: 5 }}>
                <AppLogo name={t} size={44} />
                <span style={{ fontSize: 11 }}>{t}</span>
                <StatusBadge status={i < a.tools.length ? 'online' : 'offline'} label={i < a.tools.length ? 'Connected' : 'Connect'} pulse={false} />
              </div>
            ))}
            <button className="stack" style={{ background: 'none', border: 0, alignItems: 'center', gap: 5 }} onClick={() => nav('/integrations')}><span className="icon-btn" style={{ width: 44, height: 44 }}><Plus size={18} /></span><span style={{ fontSize: 11 }}>Add More</span></button>
          </div>
        </Hud>
        <Hud corners title="Recent Activity" action="View All">
          <div className="list">
            {[[Plane, 'Searched flights to Bangalore', '09:32 AM'], [BedDouble, 'Compared 5 hotels in Koramangala', '09:25 AM'], [CalendarCheck, 'Created 3-day itinerary', '09:18 AM'], [Receipt, 'Checked visa requirements for Singapore', 'Yesterday']].map(([I, t, tm]) => {
              const Ic = I as typeof Plane;
              return <div className="li" key={t as string}><Ic size={15} className="c-cyan" /><span className="grow ellipsis" style={{ fontSize: 13 }}>{t as string}</span><span className="t-mute">{tm as string}</span><span className="tag green">Completed</span></div>;
            })}
          </div>
        </Hud>
        <Hud corners title="Suggestions for You" action="See All">
          <div className="grid g2" style={{ gap: 10 }}>
            {[['Visit Coorg this weekend', 'Based on your travel history, I found great deals to Coorg.', '#0ea5e9,#065f46'], ['Thailand trip under ₹30K', 'A 4-day trip to Bangkok & Phuket within your budget.', '#f59e0b,#7c2d12']].map(([t, s, g]) => (
              <div key={t} className="tile stack" style={{ gap: 6 }}>
                <div style={{ height: 60, borderRadius: 3, background: `linear-gradient(135deg, ${g})` }} />
                <b style={{ fontSize: 13 }}>{t}</b><span className="t-sub" style={{ fontSize: 11.5 }}>{s}</span>
                <NeonButton size="sm" block onClick={() => nav(`/chat?q=${encodeURIComponent(t)}`)}>View</NeonButton>
              </div>
            ))}
          </div>
        </Hud>
      </div>
      <DemoFlag />
    </>
  );
}

/* =================== COLLABORATION (ref 12) =================== */

const flow = ['Research Options', 'Compare & Analyze', 'Check Constraints', 'Finalize Plan', 'Execute & Confirm'];

export function Collaboration() {
  const nav = useNavigate();
  const [view, setView] = useState<'Collaboration View' | 'Task Flow' | 'Communication'>('Collaboration View');
  const [feed, setFeed] = useState(activityFeed);
  const [filter, setFilter] = useState('All Agents');
  const [step, setStep] = useState(2);
  useEffect(() => {
    const pool: [string, string][] = [['finance', 'Budget constraint checked'], ['productivity', 'Schedule conflict detected'], ['travel', 'Travel data received'], ['travel', 'Hotel options ranked'], ['communication', 'Draft ready for your approval']];
    const t = setInterval(() => {
      setStep((s) => Math.min(4, s + 1));
      setFeed((f) => {
        const [agent, text] = pool[Math.floor(Math.random() * pool.length)];
        return [{ agent, text, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }, ...f].slice(0, 7);
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);
  const netAgents = agents.filter((x) => !['core', 'calendar', 'security'].includes(x.id));
  const shownFeed = feed.filter((f) => filter === 'All Agents' || agentById(f.agent)?.name === filter);
  const pct = Math.round(((step + 1) / flow.length) * 100);

  return (
    <>
      <div className="with-rail" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>
        <Hud corners>
          <div className="row between wrap" style={{ gap: 12 }}>
            <div><h1 style={{ fontSize: 36 }}>Agent Collaboration</h1><p className="t-sub" style={{ fontSize: 16 }}>Multiple AI agents working together to achieve your goals.</p></div>
            <NeonTabs tabs={['Collaboration View', 'Task Flow', 'Communication'] as const} value={view} onChange={setView} icons={{ 'Collaboration View': Network, 'Task Flow': ListChecks, Communication: MessageCircle }} />
          </div>
          {view === 'Collaboration View' && <AgentNetwork agents={netAgents} coreLabel="Orchestrates, plans and coordinates all agents" onSelect={(id) => nav(`/agents/${id}`)} />}
          {view === 'Task Flow' && (
            <div className="stack" style={{ gap: 10, marginTop: 16 }}>
              <div className="tile"><b>Goal:</b> Plan my interview trip to Bangalore</div>
              {[['productivity', 'Detect calendar conflicts', 'completed'], ['travel', 'Compare transport options', 'completed'], ['finance', 'Check budget', step >= 2 ? 'completed' : 'processing'], ['travel', 'Add travel buffer', step >= 3 ? 'completed' : 'analyzing'], ['communication', 'Prepare rescheduling draft (needs approval)', step >= 4 ? 'warning' : 'idle'], ['core', 'Create final preparation plan', step >= 4 ? 'processing' : 'idle']].map(([id, t, st], i) => {
                const ag = agentById(id)!;
                return <div key={t} className="tile row" style={{ marginLeft: i === 0 || i === 5 ? 0 : 28 }}><IconBox icon={ag.icon} tone={ag.tone} size="sm" /><div className="grow" style={{ flex: 1 }}><div className="t-title">{t}</div><div className="t-sub">{ag.name}</div></div><StatusBadge status={st as StatusKind} /></div>;
              })}
            </div>
          )}
          {view === 'Communication' && (
            <div className="list" style={{ marginTop: 16 }}>
              {feed.map((f, i) => { const ag = agentById(f.agent)!; return <div className="li" key={i}><AgentAvatar tone={ag.tone} size={36} /><div className="grow"><div className="t-title">{ag.name} → AURA Core</div><div className="t-sub">{f.text}</div></div><span className="t-mute mono">{f.time}</span></div>; })}
            </div>
          )}
          <p className="t-mute" style={{ textAlign: 'center', marginTop: 6 }}>Shows high-level agent activity only — never private model reasoning.</p>
        </Hud>
        <div className="stack">
          <Hud corners title="Active Collaboration" action={<span className="row"><span className="dot pulse" /> Live</span>}>
            <div className="list">
              {[['productivity', 'Found schedule conflict with tomorrow’s interview.', '10:12 AM'], ['travel', 'Checking earlier flight options.', '10:12 AM'], ['finance', 'Analyzing budget for new flight.', '10:13 AM'], ['communication', 'Drafting reschedule email.', '10:13 AM'], ['core', 'Coordinating final plan…', '10:14 AM']].map(([id, t, tm]) => {
                const ag = agentById(id)!;
                return <div className="li" key={id}><IconBox icon={ag.icon} tone={ag.tone} /><div className="grow"><div className="t-title">{ag.id === 'core' ? 'AURA CORE' : ag.name}</div><div className="t-sub">{t}</div></div><span className="t-mute mono">{tm}</span></div>;
              })}
            </div>
          </Hud>
          <Hud corners title="Agent Message Feed" action={<span className="row">{filter} <ChevronDown size={12} /></span>} onAction={() => {
            const names = ['All Agents', ...new Set(feed.map((f) => agentById(f.agent)!.name))];
            setFilter((cur) => names[(names.indexOf(cur) + 1) % names.length]);
          }}>
            <div className="list" aria-live="polite">
              {shownFeed.map((f, i) => {
                const ag = agentById(f.agent)!;
                return <div className="li fade-in" key={`${f.text}${i}`}><IconBox icon={ag.icon} tone={ag.tone} size="sm" /><div className="grow"><div className="t-title">{ag.id === 'core' ? 'AURA CORE' : ag.name}</div><div className="t-sub">{f.text}</div></div><span className="t-mute mono">{f.time}</span></div>;
              })}
              {shownFeed.length === 0 && <div className="empty">No messages from this agent yet.</div>}
            </div>
          </Hud>
        </div>
      </div>

      <div className="grid auto-stack" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 400px' }}>
        <Hud corners title="Current Collaboration Goal" icon={Target} action="Edit Goal" onAction={() => nav('/decisions')}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <IconBox icon={Target} tone="cyan" size="lg" round />
            <div>
              <div className="t-title" style={{ fontSize: 16 }}>Plan my interview trip to Bangalore</div>
              <p className="t-sub" style={{ margin: '4px 0 12px' }}>Find best travel options, manage budget, adjust schedule, and prepare everything for my interview.</p>
            </div>
          </div>
          <div className="row wrap"><span className="tag blue">◉ In Progress</span><span className="tag green">4 Agents Active</span><span className="tag cyan"><Clock3 size={12} /> Est. Completion: 15 mins</span></div>
        </Hud>
        <Hud corners title="Task Flow" icon={ListChecks} action={<span className="row"><span className="dot pulse" /> Live</span>}>
          <div className="row" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
            {flow.map((s, i) => (
              <div key={s} className="stack" style={{ alignItems: 'center', gap: 6, flex: 1, textAlign: 'center', position: 'relative' }}>
                {i > 0 && <span aria-hidden style={{ position: 'absolute', top: 15, right: '50%', width: '100%', height: 2, background: i <= step ? 'var(--aura-green)' : 'var(--aura-border)', zIndex: -1 }} />}
                <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#031020', border: `2px solid ${i < step ? 'var(--aura-green)' : i === step ? 'var(--aura-cyan)' : 'var(--aura-muted)'}`, boxShadow: i <= step ? `0 0 10px ${i < step ? 'var(--aura-green)' : 'var(--aura-cyan)'}` : undefined, color: i < step ? 'var(--aura-green)' : '#fff', fontSize: 13 }}>{i < step ? <CheckCircle2 size={17} /> : i + 1}</span>
                <span style={{ fontSize: 11 }} className={i <= step ? 'c-cyan' : 't-sub'}>{s}</span>
              </div>
            ))}
          </div>
          <div className="row"><div style={{ flex: 1 }}><Bar value={pct} tone="cyan" /></div><span className="mono">{pct}%</span></div>
          <div className="t-mute" style={{ marginTop: 6 }}>{step} of {flow.length} steps completed</div>
        </Hud>
        <Hud corners title="Collaboration Insights" icon={Lightbulb}>
          <div className="grid g3" style={{ gap: 8 }}>
            {[[Timer, 'Time Saved', '~45 mins', 'Agents worked in parallel', 'green'], [Sparkles, 'Better Options', '+3 alternatives', 'Found by research agent', 'blue'], [IndianRupee, 'Cost Optimized', '₹1,200', 'Saved vs original plan', 'magenta']].map(([I, t, v, s, tone]) => (
              <div className="tile" key={t as string} style={{ textAlign: 'center', ['--bd' as string]: `${toneHex[tone as Tone]}88`, padding: 10 }}>
                <IconBox icon={I as typeof Timer} tone={tone as Tone} size="sm" />
                <div className="t-sub" style={{ marginTop: 6 }}>{t as string}</div><b style={{ fontSize: 15 }}>{v as string}</b><div className="t-mute" style={{ fontSize: 10.5 }}>{s as string}</div>
              </div>
            ))}
          </div>
        </Hud>
      </div>
    </>
  );
}
