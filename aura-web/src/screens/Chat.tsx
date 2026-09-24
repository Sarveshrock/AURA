import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarCheck, ShoppingCart, Laptop, Plane, UserRound, Mail, ChevronRight, CheckCircle2, Circle, Plus, Image, Mic, Send,
  Search, History, MoreHorizontal, FileText, CalendarDays, IndianRupee, Ticket, Play, SlidersHorizontal,
} from 'lucide-react';
import { AuraAvatar, Hud, IconBox, Wave, DemoFlag, ChatMessage, StatusBadge, NeonButton, AgentAvatar } from '../components/aura';
import ApprovalModal from '../components/ApprovalModal';
import { aura, type ChatReply, type PlanStep } from '../services/aura';
import { agentById, user } from '../data/mock';

type Msg =
  | { id: number; role: 'user'; text: string; time: string }
  | { id: number; role: 'aura'; text: string; time: string }
  | { id: number; role: 'plan'; steps: PlanStep[]; reply?: ChatReply; time: string };

const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

const suggestions = [
  { icon: CalendarCheck, t: 'Plan my day' },
  { icon: ShoppingCart, t: 'Compare food options' },
  { icon: Laptop, t: 'Find best laptop under 60k' },
  { icon: Plane, t: 'Plan a trip to Goa' },
  { icon: UserRound, t: 'Prepare for my interview' },
  { icon: Mail, t: 'Summarize my emails' },
];

const cardIcon = { travel: Plane, prep: FileText, schedule: CalendarDays, cost: IndianRupee } as const;
const cardRoute = { travel: '/travel', prep: '/tasks', schedule: '/calendar', cost: '/finance' } as const;
const actionIcon = [FileText, Ticket, Play, SlidersHorizontal];
const coordination = ['Gathering data', 'Analyzing options', 'Finding best plan', 'Preparing summary'];

export default function Chat() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, role: 'aura', text: `${greeting()}, ${user.name}! 👋\nI've analyzed your schedule, tasks, and recent activity. How can I help you today?`, time: now() },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [approval, setApproval] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  const handledQ = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const pid = idRef.current + 1;
    setMsgs((m) => [...m, { id: idRef.current, role: 'user', text, time: now() }, { id: pid, role: 'plan', steps: [], time: now() }]);
    idRef.current += 2;
    const patch = (p: Partial<Extract<Msg, { role: 'plan' }>>) => setMsgs((m) => m.map((x) => (x.id === pid && x.role === 'plan' ? { ...x, ...p } : x)));
    try {
      const reply = await aura.chat(text, (steps) => patch({ steps }));
      patch({ reply, steps: reply.steps });
    } catch {
      setMsgs((m) => [...m, { id: idRef.current++, role: 'aura', text: 'AURA AI reasoning is temporarily unavailable. Your saved tasks and calendar are still accessible.', time: now() }]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const q = params.get('q');
    if (q && !handledQ.current) {
      handledQ.current = true;
      setParams({}, { replace: true });
      void send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = input;
    setInput('');
    void send(t);
  };

  return (
    <>
      <div className="row between wrap">
        <div>
          <h1 style={{ fontSize: 32 }}>AI Chat</h1>
          <p className="t-sub" style={{ fontSize: 15 }}>Talk, Plan, Decide, and Do with AURA</p>
        </div>
        <div className="row">
          <DemoFlag />
          <div className="tile row hide-sm" style={{ padding: '6px 14px' }}>
            <span className="dot pulse cyan" />
            <div><div className="hud-label" style={{ color: '#fff', fontSize: 9.5 }}>AURA Online</div><Wave bars={12} /></div>
          </div>
          <button className="icon-btn" aria-label="Search chat"><Search size={18} /></button>
          <button className="icon-btn" aria-label="Chat history"><History size={18} /></button>
          <button className="icon-btn" aria-label="More options"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      <div className="stack" style={{ gap: 18, flex: 1 }} aria-live="polite">
        {msgs.map((m) => {
          if (m.role === 'user') return <ChatMessage key={m.id} role="user" time={m.time}>{m.text}</ChatMessage>;
          if (m.role === 'aura') {
            return (
              <ChatMessage key={m.id} role="aura" time={m.time}>
                <div className="hud" style={{ whiteSpace: 'pre-line', display: 'inline-block', fontSize: 15 }}>{m.text}</div>
                {m.id === 0 && (
                  <div className="hud" style={{ marginTop: 12 }}>
                    <div style={{ marginBottom: 12, fontWeight: 600 }}>Here are some things you can ask me:</div>
                    <div className="grid g2" style={{ gap: 8 }}>
                      {suggestions.map((s) => (
                        <button key={s.t} className="chip" style={{ justifyContent: 'flex-start', padding: '11px 12px', fontSize: 13.5 }} onClick={() => void send(s.t)}>
                          <s.icon size={17} /> <span style={{ flex: 1, textAlign: 'left' }}>{s.t}</span> <ChevronRight size={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </ChatMessage>
            );
          }
          const r = m.reply;
          const done = m.steps.filter((s) => s.status === 'done').length;
          const agentIds = r?.agents ?? ['travel', 'research', 'productivity', 'finance'];
          return (
            <div key={m.id} className="stack" style={{ gap: 16 }}>
              <ChatMessage role="aura" time={m.time}>
                <div className="hud">
                  <div style={{ marginBottom: 10, fontSize: 15 }}>{r ? r.intro : 'Got it! I\'ll coordinate with multiple agents. Here\'s what I\'ll do:'}</div>
                  {m.steps.length === 0 && <div className="row t-sub"><span className="spinner" /> Understanding your goal…</div>}
                  <div className="list">
                    {m.steps.map((s) => (
                      <div className="li" key={s.label}>
                        <CalendarCheck size={16} className="c-blue" />
                        <span className="grow" style={{ fontSize: 13.5 }}>{s.label}</span>
                        {s.status === 'done' && <span className="row c-green" style={{ fontSize: 13 }}><CheckCircle2 size={16} /> Done</span>}
                        {s.status === 'processing' && <span className="row c-cyan" style={{ fontSize: 13 }}><span className="spinner" /> Processing…</span>}
                        {s.status === 'pending' && <span className="row t-sub" style={{ fontSize: 13 }}><Circle size={16} /> Pending</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </ChatMessage>

              <Hud corners title="Live Agent Collaboration">
                <div className="row wrap" style={{ gap: 18, alignItems: 'center' }}>
                  <AuraAvatar art="android" size={130} state={r ? 'success' : 'thinking'} float={false} />
                  <div className="grid g2" style={{ flex: 1, minWidth: 260, gap: 10 }}>
                    {agentIds.map((id, i) => {
                      const a = agentById(id)!;
                      const st = r || i < done ? 'completed' : i === done ? 'processing' : 'analyzing';
                      return (
                        <div key={id} className="tile row">
                          <IconBox icon={a.icon} tone={a.tone} size="sm" />
                          <div style={{ flex: 1, minWidth: 0 }}><div className="t-title">{a.name}</div><div className="t-sub ellipsis">{st === 'completed' ? 'Completed' : a.task}</div></div>
                          <AgentAvatar tone={a.tone} size={30} />
                          <StatusBadge status={st} label="" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="tile hide-sm" style={{ width: 200, textAlign: 'center' }}>
                    <div className="hud-label" style={{ marginBottom: 10 }}>Coordinating agents…</div>
                    <div style={{ width: 56, height: 56, margin: '0 auto 10px', borderRadius: '50%', border: '3px solid var(--aura-primary)', borderTopColor: 'transparent', animation: r ? 'none' : 'spin 1.4s linear infinite', boxShadow: '0 0 12px var(--aura-primary)' }} />
                    {coordination.map((x, i) => (
                      <div key={x} className="row mono" style={{ fontSize: 10.5, padding: '2px 0', color: r || i < done ? 'var(--aura-cyan)' : 'var(--aura-muted)' }}>● {x.toUpperCase()}</div>
                    ))}
                  </div>
                </div>
              </Hud>

              {r && (
                <ChatMessage role="aura" time={m.time}>
                  <div className="hud">
                    <div style={{ marginBottom: 12, fontSize: 15 }}>{r.summary}</div>
                    <div className="grid g2" style={{ gap: 10 }}>
                      {r.cards.map((c) => {
                        const I = cardIcon[c.kind];
                        return (
                          <button key={c.title} className="tile row" style={{ textAlign: 'left', padding: 14 }} onClick={() => nav(cardRoute[c.kind])}>
                            <IconBox icon={I} tone={c.kind === 'cost' ? 'green' : 'cyan'} />
                            <div style={{ flex: 1 }}><div className="t-title">{c.title}</div><div className="t-sub">{c.sub}</div></div>
                            <ChevronRight size={17} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    {r.actions.map((a, i) => {
                      const I = actionIcon[i % actionIcon.length];
                      return (
                        <NeonButton key={a} size="sm" icon={I} onClick={() => (a.includes('approval') ? setApproval(a) : a === 'Show full plan' ? nav('/decisions') : a === 'Adjust budget' ? nav('/finance') : nav('/tasks'))}>
                          {a}
                        </NeonButton>
                      );
                    })}
                  </div>
                </ChatMessage>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form className="hud corners row" onSubmit={submit} style={{ position: 'sticky', bottom: 12, gap: 12, padding: 12, zIndex: 5 }}>
        <button type="button" className="icon-btn" aria-label="Add attachment" style={{ borderRadius: '50%' }}><Plus size={20} /></button>
        <div className="input" style={{ flex: 1, height: 54 }}>
          <input placeholder="Ask AURA anything..." value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message AURA" style={{ fontSize: 15 }} />
          <button type="button" aria-label="Attach image"><Image size={19} /></button>
          <button type="button" aria-label="Dictate" onClick={() => nav('/voice')}><Mic size={19} /></button>
        </div>
        <button type="button" className="mic-btn" style={{ width: 58, height: 58 }} aria-label="Voice mode" onClick={() => nav('/voice')}><Mic size={24} /></button>
        <button className="icon-btn" aria-label="Send message" disabled={busy} style={{ width: 50, height: 50 }}>{busy ? <span className="spinner" /> : <Send size={20} />}</button>
      </form>

      {approval && (
        <ApprovalModal
          action={approval.replace(' (with approval)', '')}
          details={['Flight: IndiGo 6E-512, Pune → Bangalore, 06:10 AM', 'Estimated cost: ₹3,200', 'Provider: MakeMyTrip (handoff)', 'Budget check: within configured limit']}
          onClose={() => setApproval(null)}
        />
      )}
    </>
  );
}
