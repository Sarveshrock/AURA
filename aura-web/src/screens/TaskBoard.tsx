import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, CalendarDays, Flag, Sparkles, ListChecks, Activity, CheckCircle2, AlertCircle, List, LayoutGrid, X, MoreHorizontal,
  Plane, ShoppingCart, Heart, Mail, Presentation, Utensils, Video, FileText, Filter, Clock, AlignLeft, CircleDot, Link2,
  Briefcase, BookOpen, IndianRupee, Wand2, Dumbbell,
} from 'lucide-react';
import { Hud, IconBox, Bar, NeonButton, NeonTabs, AppLogo, DemoFlag, toast, toneHex, type Tone } from '../components/aura';
import { agentById } from '../data/mock';

type Bucket = 'today' | 'upcoming' | 'overdue';
interface Task {
  id: string; title: string; time: string; date?: string; agent: string; done: boolean; priority: 'High' | 'Medium' | 'Low';
  icon: typeof Plane; tone: Tone; bucket: Bucket; description?: string; apps?: string[]; subtasks?: { t: string; done: boolean }[];
}

const seed: Task[] = [
  { id: 't1', title: 'Attend interview (Bangalore)', time: '10:00 AM – 11:00 AM', agent: 'travel', done: true, priority: 'High', icon: Plane, tone: 'blue', bucket: 'today' },
  { id: 't2', title: 'Review project presentation', time: '11:30 AM – 12:30 PM', agent: 'productivity', done: true, priority: 'Medium', icon: Presentation, tone: 'amber', bucket: 'today' },
  { id: 't3', title: 'Lunch break', time: '01:00 PM – 01:30 PM', agent: 'wellness', done: false, priority: 'Low', icon: Utensils, tone: 'violet', bucket: 'today' },
  { id: 't4', title: 'Work meeting (Team Sync)', time: '04:00 PM – 05:00 PM', agent: 'communication', done: false, priority: 'High', icon: Video, tone: 'blue', bucket: 'today',
    description: 'Discuss project progress, blockers and next steps with the team.', apps: ['Google Meet', 'Google Calendar', 'Gmail', 'Notion'],
    subtasks: [{ t: 'Prepare meeting notes', done: false }, { t: 'Share updated project status', done: false }, { t: 'Follow up on action items', done: false }] },
  { id: 't5', title: 'Update resume', time: '05:30 PM – 06:00 PM', agent: 'research', done: false, priority: 'Medium', icon: FileText, tone: 'amber', bucket: 'today' },
  { id: 't6', title: 'Plan weekend trip', time: '07:00 PM – 07:30 PM', agent: 'travel', done: false, priority: 'Low', icon: Plane, tone: 'blue', bucket: 'today' },
  { id: 'u1', title: 'Gym workout', date: 'Oct 15|Wed', time: '07:00 AM – 08:00 AM', agent: 'wellness', done: false, priority: 'Low', icon: Dumbbell, tone: 'blue', bucket: 'upcoming' },
  { id: 'u2', title: 'Grocery shopping', date: 'Oct 15|Wed', time: '12:00 PM – 01:00 PM', agent: 'shopping', done: false, priority: 'Low', icon: ShoppingCart, tone: 'amber', bucket: 'upcoming' },
  { id: 'u3', title: 'Client call (Capco)', date: 'Oct 16|Thu', time: '11:00 AM – 12:00 PM', agent: 'communication', done: false, priority: 'Medium', icon: Briefcase, tone: 'blue', bucket: 'upcoming' },
  { id: 'u4', title: 'Pay credit card bill', date: 'Oct 17|Fri', time: '09:00 AM – 09:30 AM', agent: 'finance', done: false, priority: 'High', icon: IndianRupee, tone: 'green', bucket: 'upcoming' },
  { id: 'o1', title: 'Submit expense report', date: 'Oct 12|Sun', time: 'Overdue 2 days', agent: 'finance', done: false, priority: 'High', icon: IndianRupee, tone: 'red', bucket: 'overdue' },
  { id: 'o2', title: 'Read Agentic AI paper', date: 'Oct 13|Mon', time: 'Overdue 1 day', agent: 'research', done: false, priority: 'Low', icon: BookOpen, tone: 'red', bucket: 'overdue' },
];

const suggestions: { icon: typeof Plane; tone: Tone; t: string; agent: string; bucket: Bucket }[] = [
  { icon: Plane, tone: 'blue', t: 'Check-in for your flight tomorrow', agent: 'travel', bucket: 'upcoming' },
  { icon: ShoppingCart, tone: 'amber', t: 'Reorder your regular groceries', agent: 'shopping', bucket: 'upcoming' },
  { icon: CalendarDays, tone: 'blue', t: 'Prepare for interview: Suggested study plan', agent: 'research', bucket: 'today' },
  { icon: Heart, tone: 'magenta', t: 'Time for a 30 min workout', agent: 'wellness', bucket: 'today' },
  { icon: Mail, tone: 'blue', t: 'Follow up on pending emails', agent: 'communication', bucket: 'today' },
];

const tabs = ['All Tasks', 'Today', 'Upcoming', 'Completed', 'Overdue'] as const;
type TabT = (typeof tabs)[number];

function agentTone(id: string): Tone { return agentById(id)?.tone ?? 'blue'; }

export default function Tasks() {
  const nav = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(seed);
  const [tab, setTab] = useState<TabT>('All Tasks');
  const [view, setView] = useState<'List' | 'Board'>('List');
  const [draft, setDraft] = useState('');
  const [selId, setSelId] = useState<string | null>('t4');
  const [sugs, setSugs] = useState(suggestions);
  const [newSub, setNewSub] = useState('');
  const sel = tasks.find((t) => t.id === selId) ?? null;

  const counts = useMemo<Record<TabT, number>>(() => ({
    'All Tasks': tasks.length,
    Today: tasks.filter((t) => t.bucket === 'today').length,
    Upcoming: tasks.filter((t) => t.bucket === 'upcoming').length,
    Completed: tasks.filter((t) => t.done).length,
    Overdue: tasks.filter((t) => t.bucket === 'overdue' && !t.done).length,
  }), [tasks]);

  const inTab = (t: Task) => tab === 'All Tasks' || (tab === 'Completed' ? t.done : tab === 'Today' ? t.bucket === 'today' : tab === 'Upcoming' ? t.bucket === 'upcoming' : t.bucket === 'overdue' && !t.done);
  const today = tasks.filter((t) => t.bucket === 'today' && inTab(t));
  const later = tasks.filter((t) => t.bucket !== 'today' && inTab(t));
  const todayAll = tasks.filter((t) => t.bucket === 'today');
  const todayDone = todayAll.filter((t) => t.done).length;

  const update = (id: string, p: Partial<Task>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const add = (title: string, bucket: Bucket = 'today', agent = 'productivity') => {
    const time = title.match(/\b(\d{1,2}(:\d{2})?\s?(am|pm))\b/i)?.[1]?.toUpperCase() ?? 'Anytime';
    const t: Task = { id: `n${Date.now()}`, title: title.replace(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i, '').trim(), time, agent, done: false, priority: 'Medium', icon: CircleDot, tone: agentTone(agent), bucket: /tomorrow/i.test(title) ? 'upcoming' : bucket, date: /tomorrow/i.test(title) ? 'Tmrw|' : undefined };
    setTasks((ts) => [t, ...ts]);
    setSelId(t.id);
    toast(`Task created — ${agentById(agent)?.name} assigned.`);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); if (draft.trim()) { add(draft); setDraft(''); } };

  const renderRow = (t: Task) => {
    const a = agentById(t.agent)!;
    return (
      <div key={t.id} className={`task-row ${selId === t.id ? 'sel' : ''}`} role="row">
        <input type="checkbox" className="check" checked={t.done} onChange={() => update(t.id, { done: !t.done })} aria-label={`Complete ${t.title}`} />
        {t.date ? <span className="mono t-sub" style={{ fontSize: 11, lineHeight: 1.2 }}>{t.date.split('|')[0]}<br />{t.date.split('|')[1]}</span> : <IconBox icon={t.icon} tone={t.tone} size="sm" />}
        <button onClick={() => setSelId(t.id)} style={{ background: 'none', border: 0, textAlign: 'left', padding: 0, minWidth: 0 }} className="row">
          {t.date && <IconBox icon={t.icon} tone={t.tone} size="sm" />}
          <span className="t-title ellipsis" style={{ textDecoration: t.done ? 'line-through' : undefined, opacity: t.done ? 0.6 : 1 }}>{t.title}</span>
        </button>
        <span className="t-sub t-time" style={{ fontSize: 12.5 }}>{t.time}</span>
        <span className="t-agent"><span className="tag" style={{ color: toneHex[a.tone], borderColor: `${toneHex[a.tone]}66`, background: `${toneHex[a.tone]}14` }}><a.icon size={12} /> {a.name}</span></span>
        <Flag size={16} className="t-flag" style={{ color: t.priority === 'High' ? 'var(--aura-danger)' : t.priority === 'Medium' ? 'var(--aura-warning)' : 'var(--aura-muted)' }} fill={t.priority === 'High' ? 'currentColor' : 'none'} aria-label={`${t.priority} priority`} />
        <button className="icon-btn bare" style={{ width: 26, height: 26 }} aria-label={`Details for ${t.title}`} onClick={() => setSelId(t.id)}><MoreHorizontal size={16} /></button>
      </div>
    );
  };

  return (
    <>
      <div className="hero" style={{ minHeight: 170, flexWrap: 'wrap' }}>
        <img className="hero-bg" src="/aura/tasks-android.jpg" alt="" style={{ width: '24%' }} />
        <div style={{ minWidth: 260 }}>
          <h1 style={{ fontSize: 44 }}>Tasks</h1>
          <p style={{ fontSize: 19, marginTop: 2 }}>Let AURA handle the details.</p>
          <p className="t-sub" style={{ maxWidth: 440, marginTop: 6, fontSize: 13.5 }}>Create, track, and automate your tasks. AURA can plan, prioritize, and execute steps across your apps and agents.</p>
        </div>
        <div className="row wrap" style={{ gap: 10 }}>
          {[[List, counts['All Tasks'], 'Total Tasks', 'blue'], [Activity, todayAll.filter((t) => !t.done).length, 'In Progress', 'cyan'], [CheckCircle2, counts.Completed, 'Completed', 'green'], [AlertCircle, counts.Overdue, 'Overdue', 'red']].map(([I, v, l, t]) => {
            const Ic = I as typeof List;
            return <div className="tile row" key={l as string} style={{ padding: '12px 16px', ['--bd' as string]: t === 'red' ? 'rgba(255,79,109,0.6)' : undefined }}><Ic size={30} style={{ color: toneHex[t as Tone], filter: `drop-shadow(0 0 6px ${toneHex[t as Tone]})` }} /><div><b style={{ fontSize: 24 }}>{v as number}</b><div className="t-sub">{l as string}</div></div></div>;
          })}
        </div>
        <div className="stack" style={{ marginLeft: 'auto', alignItems: 'flex-end', gap: 12 }}>
          <div className="hero-quote hide-sm" style={{ fontSize: 16, marginRight: '22%' }}>“Thoughts into Action.<br />Automatically.”</div>
          <NeonButton variant="primary" size="lg" icon={Plus} onClick={() => document.getElementById('quick-add')?.focus()}>New Task</NeonButton>
        </div>
      </div>

      <div className="row between wrap">
        <NeonTabs tabs={tabs} value={tab} onChange={setTab} counts={counts} />
        <div className="row">
          <NeonTabs tabs={['List', 'Board', 'Calendar'] as const} value={view} onChange={(v) => (v === 'Calendar' ? nav('/calendar') : setView(v))} icons={{ List, Board: LayoutGrid, Calendar: CalendarDays }} />
          <NeonButton icon={Filter} onClick={() => setTab(tab === 'Overdue' ? 'All Tasks' : 'Overdue')}>Filter</NeonButton>
        </div>
      </div>

      <div className="tasks-layout">
        <div className="stack">
          <Hud corners title="Quick Add Task" icon={Wand2}>
            <form className="input" onSubmit={submit} style={{ height: 52 }}>
              <input id="quick-add" placeholder="Tell AURA what you want to do..." value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Quick add task" />
              <button aria-label="Create task"><Sparkles size={20} className="c-cyan" /></button>
            </form>
            <div className="t-sub" style={{ margin: '12px 0 8px' }}>Examples:</div>
            <div className="row wrap" style={{ gap: 8 }}>
              {[[Plane, 'Plan my trip to Goa', 'travel'], [Sparkles, 'Prepare for interview', 'research'], [ShoppingCart, 'Order groceries', 'shopping'], [BookOpen, 'Create study plan', 'productivity']].map(([I, t, ag]) => {
                const Ic = I as typeof Plane;
                return <button key={t as string} className="chip" onClick={() => add(t as string, 'today', ag as string)}><Ic size={13} /> {t as string}</button>;
              })}
            </div>
          </Hud>
          <Hud corners title="AI Suggestions" icon={Sparkles} action="See All">
            <div className="list">
              {sugs.map((s) => (
                <div className="li" key={s.t}>
                  <IconBox icon={s.icon} tone={s.tone} size="sm" />
                  <span className="grow" style={{ fontSize: 13 }}>{s.t}</span>
                  <NeonButton size="sm" variant="primary" onClick={() => { add(s.t, s.bucket, s.agent); setSugs((x) => x.filter((y) => y.t !== s.t)); }}>Add</NeonButton>
                </div>
              ))}
              {sugs.length === 0 && <div className="empty">All suggestions added.</div>}
            </div>
          </Hud>
        </div>

        <div className="stack">
          {view === 'List' ? (
            <>
              <Hud corners>
                <div className="hud-head">
                  <h3><CalendarDays size={18} /> Today's Tasks <span className="t-sub" style={{ fontWeight: 400 }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span></h3>
                  <div className="row hide-sm" style={{ marginLeft: 'auto', width: 220 }}><div style={{ flex: 1 }}><Bar value={(todayDone / Math.max(1, todayAll.length)) * 100} tone="green" /></div><span className="t-sub">{todayDone}/{todayAll.length} completed</span></div>
                </div>
                <div className="list" role="table" aria-label="Today's tasks">{today.map((t) => renderRow(t))}</div>
                {today.length === 0 && <div className="empty">Nothing here for this filter.</div>}
              </Hud>
              <Hud corners title={tab === 'Overdue' ? 'Overdue Tasks' : 'Upcoming Tasks'} icon={ListChecks} action="View All" onAction={() => setTab('Upcoming')}>
                <div className="list" role="table" aria-label="Upcoming tasks">{later.map((t) => renderRow(t))}</div>
                {later.length === 0 && <div className="empty">Nothing upcoming for this filter.</div>}
              </Hud>
            </>
          ) : (
            <div className="grid g3">
              {(['today', 'upcoming', 'overdue'] as const).map((b) => (
                <Hud corners key={b} title={b[0].toUpperCase() + b.slice(1)}>
                  <div className="stack" style={{ gap: 8 }}>
                    {tasks.filter((t) => t.bucket === b && inTab(t)).map((t) => (
                      <button key={t.id} className="tile" onClick={() => setSelId(t.id)} style={{ textAlign: 'left', ['--bd' as string]: selId === t.id ? 'var(--aura-primary-bright)' : undefined }}>
                        <div className="row"><IconBox icon={t.icon} tone={t.tone} size="sm" /><span className="t-title" style={{ textDecoration: t.done ? 'line-through' : undefined }}>{t.title}</span></div>
                        <div className="t-sub" style={{ marginTop: 6 }}>{t.time}</div>
                      </button>
                    ))}
                  </div>
                </Hud>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          {sel ? (
            <Hud corners title="Task Details" action={<X size={15} aria-label="Close details" />} onAction={() => setSelId(null)}>
              <div className="row" style={{ marginBottom: 14 }}><input type="checkbox" className="check" checked={sel.done} onChange={() => update(sel.id, { done: !sel.done })} aria-label="Mark complete" /><b style={{ fontSize: 17 }}>{sel.title}</b></div>
              <div className="list">
                <div className="li" style={{ alignItems: 'flex-start' }}><span className="row t-sub" style={{ width: 110 }}><Clock size={15} /> Time</span><span style={{ fontSize: 13 }}>{sel.date ? sel.date.replace('|', ', ') : 'Today'}<br />{sel.time}</span></div>
                <div className="li" style={{ alignItems: 'flex-start' }}><span className="row t-sub" style={{ width: 110, flexShrink: 0 }}><AlignLeft size={15} /> Description</span><span style={{ fontSize: 13 }}>{sel.description ?? 'No description yet — ask AURA to draft one.'}</span></div>
                <div className="li"><span className="row t-sub" style={{ width: 110 }}><Sparkles size={15} /> Agent</span>
                  <select className="select" style={{ flex: 1 }} value={sel.agent} onChange={(e) => update(sel.id, { agent: e.target.value })} aria-label="Assigned agent">
                    {['travel', 'productivity', 'communication', 'research', 'finance', 'shopping', 'wellness'].map((id) => <option key={id} value={id}>{agentById(id)?.name}</option>)}
                  </select>
                </div>
                <div className="li"><span className="row t-sub" style={{ width: 110 }}><Flag size={15} /> Priority</span>
                  <select className="select" style={{ flex: 1 }} value={sel.priority} onChange={(e) => update(sel.id, { priority: e.target.value as Task['priority'] })} aria-label="Priority"><option>High</option><option>Medium</option><option>Low</option></select>
                </div>
                <div className="li"><span className="row t-sub" style={{ width: 110 }}><CircleDot size={15} /> Status</span>
                  <select className="select" style={{ flex: 1 }} value={sel.done ? 'Completed' : 'Pending'} onChange={(e) => update(sel.id, { done: e.target.value === 'Completed' })} aria-label="Status"><option>Pending</option><option>Completed</option></select>
                </div>
                <div className="li" style={{ alignItems: 'flex-start' }}><span className="row t-sub" style={{ width: 110 }}><Link2 size={15} /> Related Apps</span>
                  <div className="row wrap" style={{ gap: 10 }}>{(sel.apps ?? ['Google Calendar']).map((a) => <div key={a} className="stack" style={{ alignItems: 'center', gap: 3 }}><AppLogo name={a} size={32} /><span style={{ fontSize: 10 }}>{a}</span></div>)}</div>
                </div>
              </div>
              <NeonButton variant="primary" block icon={Sparkles} style={{ margin: '14px 0' }} onClick={() => nav(`/chat?q=${encodeURIComponent('Handle this task: ' + sel.title)}`)}>Ask AURA to Handle This Task</NeonButton>
              <div className="t-title" style={{ marginBottom: 6 }}>Subtasks ({sel.subtasks?.length ?? 0})</div>
              {(sel.subtasks ?? []).map((s, i) => (
                <label key={s.t} className="row" style={{ fontSize: 13.5, padding: '5px 0', cursor: 'pointer' }}>
                  <input type="checkbox" className="check" checked={s.done} onChange={() => update(sel.id, { subtasks: sel.subtasks!.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} />
                  <span style={{ textDecoration: s.done ? 'line-through' : undefined }}>{s.t}</span>
                </label>
              ))}
              <form className="row" style={{ marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); if (!newSub.trim()) return; update(sel.id, { subtasks: [...(sel.subtasks ?? []), { t: newSub, done: false }] }); setNewSub(''); }}>
                <div className="input" style={{ flex: 1, height: 40 }}><input placeholder="Add a subtask" value={newSub} onChange={(e) => setNewSub(e.target.value)} aria-label="New subtask" /></div>
                <NeonButton size="sm" icon={Plus} type="submit" aria-label="Add subtask">Add</NeonButton>
              </form>
            </Hud>
          ) : (
            <Hud corners title="Task Details"><div className="empty">Select a task to see details.</div></Hud>
          )}
          <DemoFlag />
        </div>
      </div>
    </>
  );
}
