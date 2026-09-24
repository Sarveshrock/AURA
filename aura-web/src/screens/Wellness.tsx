import { useEffect, useState } from 'react';
import {
  Leaf, ClipboardList, Bell, BarChart3, Flower2, LayoutDashboard, Dumbbell, Utensils, Brain, Moon, HeartPulse, Target, ClipboardCheck, Mic,
  GlassWater, Smile, Sun, Wind, Plus, Pause, Play,
} from 'lucide-react';
import { Hud, PageHero, NeonButton, NeonTabs, FilterDropdown, Donut, FuturisticModal, HudInput, DemoFlag, toast, toneHex, type Tone } from '../components/aura';
import { AICommandPanel, confirmActions, type AIReply } from '../components/ai';
import { PlanRow, MetricRow, MealRow } from '../components/wellness';
import { mockPlan, mockMetrics, mockMeals, nutrition, weekly, type PlanItem } from '../data/mockWellnessData';
import { uid } from '../state/store';
import { usePageSearch, matches } from '../state/search';

const TABS = ['Overview', 'Fitness', 'Nutrition', 'Mindfulness', 'Sleep', 'Health Metrics', 'Habit Tracker', 'Wellness Plan'] as const;
type Tab = (typeof TABS)[number];
const tabIcons = { Overview: LayoutDashboard, Fitness: Dumbbell, Nutrition: Utensils, Mindfulness: Flower2, Sleep: Moon, 'Health Metrics': HeartPulse, 'Habit Tracker': Target, 'Wellness Plan': ClipboardCheck };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeeklyChart({ data }: { data: { steps: number[]; cal: number[]; sleep: number[] } }) {
  const H = 200, W = 420, pad = 26, slot = (W - pad) / 7, bw = 7;
  const series = [[data.steps, '#00E5A8'], [data.cal, '#FF4FD8'], [data.sleep, '#8B5CFF']] as const;
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="chart-svg" role="img" aria-label="Weekly steps, calories and sleep">
      {[0, 25, 50, 75, 100].map((v) => <g key={v}><line x1={pad} x2={W} y1={H - (v / 100) * (H - 10)} y2={H - (v / 100) * (H - 10)} stroke="rgba(0,174,255,0.08)" /><text x={0} y={H - (v / 100) * (H - 10) + 4}>{v}</text></g>)}
      {DAYS.map((d, i) => (
        <g key={d}>
          {series.map(([vals, c], k) => {
            const h = (vals[i] / 100) * (H - 10);
            return <rect key={k} x={pad + slot * i + slot / 2 - 12 + k * (bw + 2)} y={H - h} width={bw} height={h} rx="2" fill={c} style={{ filter: `drop-shadow(0 0 4px ${c})` }}><title>{`${d}: ${vals[i]}`}</title></rect>;
          })}
          <text x={pad + slot * i + slot / 2} y={H + 16} textAnchor="middle">{d}</text>
        </g>
      ))}
    </svg>
  );
}

function Breathing({ minutes, title, onClose }: { minutes: number; title: string; onClose: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  const [run, setRun] = useState(true);
  useEffect(() => {
    if (!run || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [run, left]);
  const phase = Math.floor(left / 4) % 2 ? 'Breathe in' : 'Breathe out';
  return (
    <FuturisticModal title={title} icon={Flower2} onClose={onClose}>
      <div className="stack" style={{ alignItems: 'center', gap: 16, padding: 10 }}>
        <div className="breath" style={{ animationPlayState: run ? 'running' : 'paused' }} aria-hidden />
        <div className="t-title" style={{ fontSize: 20 }} aria-live="polite">{left > 0 ? phase : 'Session complete'}</div>
        <div className="mono" style={{ fontSize: 28 }}>{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</div>
        <div className="row">
          <NeonButton icon={run ? Pause : Play} onClick={() => setRun((r) => !r)} disabled={left <= 0}>{run ? 'Pause' : 'Resume'}</NeonButton>
          <NeonButton variant="primary" onClick={() => { onClose(); toast(`${title} logged.`); }}>Finish</NeonButton>
        </div>
      </div>
    </FuturisticModal>
  );
}

export default function Wellness() {
  const q = usePageSearch();
  const [tab, setTab] = useState<Tab>('Overview');
  const [plan, setPlan] = useState<PlanItem[]>(mockPlan);
  const [meals, setMeals] = useState(mockMeals);
  const [week, setWeek] = useState<'This Week' | 'Last Week'>('This Week');
  const [water, setWater] = useState(1);
  const [mood, setMood] = useState<string | null>(null);
  const [session, setSession] = useState<{ title: string; minutes: number } | null>(null);
  const [log, setLog] = useState<'meal' | 'mood' | 'plan' | null>(null);
  const [mealText, setMealText] = useState('');
  const [newItem, setNewItem] = useState({ time: '6:00 PM', title: '' });
  const [habits, setHabits] = useState<Record<string, boolean[]>>({
    'Meditate 10 min': [true, true, false, true, true, true, false], 'Walk 8k steps': [true, false, true, true, false, true, true],
    'Drink 2L water': [true, true, true, false, true, true, true], 'Sleep by 11 PM': [false, true, true, false, true, false, true],
  });

  const show = (...tabs: Tab[]) => tab === 'Overview' || tabs.includes(tab);
  const areaFor: Partial<Record<Tab, PlanItem['area']>> = { Fitness: 'Fitness', Nutrition: 'Nutrition', Mindfulness: 'Mindfulness', Sleep: 'Sleep' };
  const planItems = plan.filter((p) => (!areaFor[tab] || p.area === areaFor[tab]) && matches(q, p.title, p.sub, p.area));
  const togglePlan = (id: string) => setPlan((ps) => ps.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  const done = plan.filter((p) => p.done).length;
  const kcal = meals.filter((m) => m.eaten).reduce((s, m) => s + m.kcal, 0);

  const ai = (p: string): AIReply => {
    const t = p.toLowerCase();
    if (/workout plan|7-day/.test(t)) return { text: 'A balanced 7-day plan for your current routine (3–4 sessions/week):', preview: ['Mon · Full body 30 min', 'Tue · 30 min brisk walk', 'Wed · Upper body + core', 'Thu · Rest / stretching', 'Fri · Lower body', 'Sat · Yoga 40 min', 'Sun · Rest'],
      actions: confirmActions('Add to my Wellness Plan', () => { setPlan((ps) => [...ps, { id: uid('w'), time: '7:00 AM', title: 'Weekly workout plan', sub: '7-day schedule saved', icon: Dumbbell, tone: 'magenta', done: false, area: 'Fitness' }]); return 'Workout plan added to your Wellness Plan.'; }) };
    if (/meal/.test(t)) return { text: 'A mostly-vegetarian day around 1,850 kcal (your target):', preview: ['Breakfast · Oats, fruit & nuts (350)', 'Lunch · Rajma, brown rice, salad (550)', 'Snack · Greek yogurt & seeds (200)', 'Dinner · Paneer tikka salad (450)'],
      actions: confirmActions('Update today\'s meals', () => { setMeals((ms) => ms.map((m) => (m.name === 'Lunch' ? { ...m, dish: 'Rajma, brown rice, salad', kcal: 550 } : m))); return 'Today’s lunch updated in your meal plan.'; }) };
    if (/stress/.test(t)) return { text: 'Try box breathing (4-4-4-4) for 5 minutes, a 20-minute walk outdoors, and a screen-free wind-down. If stress feels persistent or overwhelming, please talk to a qualified professional.',
      actions: [{ label: 'Start 5-min breathing', variant: 'primary', run: () => { setSession({ title: 'Breathing', minutes: 5 }); return 'Starting a 5-minute breathing session.'; } }, { label: 'Cancel', run: () => 'Okay.' }] };
    if (/sleep/.test(t)) return { text: 'A sleep routine based on your 11:30 PM bedtime:', preview: ['10:30 PM · Dim lights, no screens', '10:45 PM · Stretching or reading', '11:15 PM · Sleep sounds', '11:30 PM · Lights out — target 7.5–8 h'],
      actions: confirmActions('Add wind-down reminders', () => { setPlan((ps) => [...ps, { id: uid('w'), time: '10:30 PM', title: 'Wind-down routine', sub: 'No screens, dim lights', icon: Moon, tone: 'violet', done: false, area: 'Sleep' }]); return 'Wind-down routine added for 10:30 PM.'; }) };
    if (/water/.test(t)) return { text: 'I can remind you to drink water every hour from 9 AM to 8 PM (12 reminders).', actions: confirmActions('Create reminders', () => 'Hourly water reminders created (9 AM – 8 PM).') };
    return { text: 'I can build workout, meal, sleep and mindfulness routines. I don\'t diagnose medical conditions — for symptoms, please consult a doctor.' };
  };

  return (
    <div className="module">
      <div className="main">
        <PageHero title={<>Wellness <span className="grad">Smarter</span><br />with <span className="grad">AURA</span></>} lead="Your personal AI wellness coach for a healthier, happier you." image="/aura/hero-wellness.jpg" imageWidth="26%" quote="A Healthier You. A Brighter Tomorrow."
          feats={[
            { icon: Leaf, title: 'Track Health', sub: 'All in one place', tone: 'teal' },
            { icon: ClipboardList, title: 'Personalized Plans', sub: 'AI-powered', tone: 'magenta' },
            { icon: Bell, title: 'Reminders', sub: 'Stay consistent', tone: 'teal' },
            { icon: BarChart3, title: 'Insights', sub: 'Track progress', tone: 'violet' },
            { icon: Flower2, title: 'Holistic Wellness', sub: 'Mind • Body • Life', tone: 'teal' },
          ]} />

        <NeonTabs tabs={TABS} value={tab} onChange={setTab} icons={tabIcons} />

        {tab === 'Habit Tracker' ? (
          <Hud corners title="Habit Tracker" sub="Tap a day to toggle. Streaks update instantly.">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Habit</th>{DAYS.map((d) => <th key={d} style={{ textAlign: 'center' }}>{d}</th>)}<th style={{ textAlign: 'right' }}>Done</th></tr></thead>
                <tbody>{Object.entries(habits).map(([h, days]) => (
                  <tr key={h}><td>{h}</td>{days.map((v, i) => (
                    <td key={i} style={{ textAlign: 'center' }}><input type="checkbox" className="check" checked={v} onChange={() => setHabits((hs) => ({ ...hs, [h]: hs[h].map((x, j) => (j === i ? !x : x)) }))} aria-label={`${h} on ${DAYS[i]}`} /></td>
                  ))}<td style={{ textAlign: 'right' }} className="mono">{days.filter(Boolean).length}/7</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Hud>
        ) : (
          <div className="grid wellness-grid">
            {(show('Fitness', 'Nutrition', 'Mindfulness', 'Sleep', 'Wellness Plan')) && (
              <Hud corners className="w-plan" title={<span className="section-title" style={{ fontSize: 20 }}>Today's Wellness Plan</span>} action={`${done}/${plan.length} done`}>
                <div>{planItems.map((p, i) => <PlanRow key={p.id} item={p} last={i === planItems.length - 1} onToggle={() => togglePlan(p.id)} />)}</div>
                {!planItems.length && <div className="empty">Nothing in this area yet.</div>}
                {tab === 'Wellness Plan' && <NeonButton icon={Plus} block onClick={() => setLog('plan')}>Add to plan</NeonButton>}
              </Hud>
            )}
            {show('Fitness', 'Sleep') && (
              <Hud corners>
                <div className="row between" style={{ marginBottom: 8 }}>
                  <h2 className="section-title" style={{ fontSize: 20 }}>Weekly Progress</h2>
                  <FilterDropdown value={week} options={['This Week', 'Last Week'] as const} onChange={setWeek} align="right" />
                </div>
                <WeeklyChart data={week === 'This Week' ? weekly.This : weekly.Last} />
                <div className="row" style={{ justifyContent: 'center', gap: 16, fontSize: 13 }}>
                  {[['Steps', '#00E5A8'], ['Calories', '#FF4FD8'], ['Sleep (hrs)', '#8B5CFF']].map(([l, c]) => <span key={l} className="row" style={{ gap: 6 }}><span className="dot" style={{ background: c, color: c }} /> {l}</span>)}
                </div>
              </Hud>
            )}
            {show('Health Metrics') && (
              <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Health Metrics</span>}>
                <div className="list">{mockMetrics.filter((m) => matches(q, m.name)).map((m) => <MetricRow key={m.id} m={m} />)}</div>
                <p className="t-mute" style={{ marginTop: 6 }}>Self-reported / sample data. Not a medical diagnosis.</p>
              </Hud>
            )}
            {show('Mindfulness') && (
              <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Mindfulness</span>}>
                <div className="grid g2" style={{ gap: 10 }}>
                  {([[Leaf, '5 min', 'Breathing', 'teal', 5], [Flower2, '10 min', 'Meditation', 'violet', 10], [Moon, 'Sleep Sounds', '', 'blue', 15], [Sun, 'Stress Relief', '', 'amber', 3]] as const).map(([I, a, b, tone, min]) => (
                    <button key={a} className="tile row" style={{ gap: 10, ['--bd' as string]: `${toneHex[tone as Tone]}88` }} onClick={() => setSession({ title: `${a} ${b}`.trim(), minutes: min })}>
                      <I size={26} style={{ color: toneHex[tone as Tone] }} /><span style={{ textAlign: 'left' }}><b>{a}</b><br /><span className="t-sub">{b}</span></span>
                    </button>
                  ))}
                </div>
              </Hud>
            )}
            {show('Nutrition') && (
              <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Nutrition Insights</span>}>
                <div className="row wrap" style={{ gap: 18 }}>
                  <Donut data={nutrition} size={140} stroke={16} center={kcal.toLocaleString('en-IN')} sub="kcal eaten" />
                  <div className="legend" style={{ flex: 1, minWidth: 140 }}>{nutrition.map((n) => <div key={n.label} className="legend-row"><span className="sw" style={{ background: n.color, borderRadius: '50%' }} /><span>{n.label}</span><span className="v">{n.value}%</span></div>)}</div>
                </div>
                <div className="t-sub" style={{ marginTop: 8 }}>Target 1,850 kcal · Water {water}/8 glasses</div>
              </Hud>
            )}
          </div>
        )}
        <DemoFlag label="DEMO WELLNESS DATA — connect a health provider for real readings" />
      </div>

      <div className="rail">
        <AICommandPanel title="Ask AURA Wellness" prompts={['Create a 7-day workout plan for me', 'Suggest a healthy meal plan', 'How can I reduce stress?', 'Generate a personalized sleep routine', 'Remind me to drink water every hour']}
          onAsk={ai} cta="Talk to AURA" ctaIcon={Mic} placeholder="Ask about workouts, meals, sleep…" />
        <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Today's Meals</span>} action="Log meal" onAction={() => setLog('meal')}>
          <div className="list">{meals.map((m) => <MealRow key={m.id} meal={m} onToggle={() => setMeals((ms) => ms.map((x) => (x.id === m.id ? { ...x, eaten: !x.eaten } : x)))} />)}</div>
        </Hud>
        <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Quick Actions</span>}>
          <div className="grid g2" style={{ gap: 10 }}>
            {([
              [Utensils, 'Log Meal', 'red', () => setLog('meal')],
              [Dumbbell, 'Log Workout', 'violet', () => { setPlan((ps) => ps.map((p) => (p.title === 'Workout' ? { ...p, done: true } : p))); toast('Workout logged — nice work!'); }],
              [GlassWater, `Log Water (${water}/8)`, 'blue', () => { setWater((w) => Math.min(8, w + 1)); toast(`Water logged: ${Math.min(8, water + 1)}/8 glasses.`); }],
              [Smile, mood ? `Mood: ${mood}` : 'Log Mood', 'magenta', () => setLog('mood')],
            ] as const).map(([I, l, tone, fn]) => (
              <button key={l} className="tile stack" style={{ alignItems: 'center', gap: 6, ['--bd' as string]: `${toneHex[tone as Tone]}88` }} onClick={fn}>
                <I size={24} style={{ color: toneHex[tone as Tone] }} /><span style={{ fontSize: 12.5 }}>{l}</span>
              </button>
            ))}
          </div>
        </Hud>
      </div>

      {session && <Breathing {...session} onClose={() => setSession(null)} />}
      {log === 'meal' && (
        <FuturisticModal title="Log Meal" icon={Utensils} onClose={() => setLog(null)}>
          <form className="stack" style={{ gap: 12 }} onSubmit={(e) => { e.preventDefault(); const next = meals.find((m) => !m.eaten); if (next) setMeals((ms) => ms.map((m) => (m.id === next.id ? { ...m, eaten: true, dish: mealText || m.dish } : m))); toast(next ? `${next.name} logged.` : 'All meals already logged.'); setLog(null); setMealText(''); }}>
            <HudInput label="What did you eat?" value={mealText} onChange={(e) => setMealText(e.target.value)} placeholder={meals.find((m) => !m.eaten)?.dish ?? 'e.g. Fruit bowl'} autoFocus />
            <div className="row" style={{ justifyContent: 'flex-end' }}><NeonButton type="button" onClick={() => setLog(null)}>Cancel</NeonButton><NeonButton type="submit" variant="primary">Log</NeonButton></div>
          </form>
        </FuturisticModal>
      )}
      {log === 'mood' && (
        <FuturisticModal title="How are you feeling?" icon={Smile} onClose={() => setLog(null)}>
          <div className="seg">{['Great', 'Good', 'Okay', 'Low', 'Stressed'].map((m) => <button key={m} className={`chip ${mood === m ? 'active' : ''}`} onClick={() => { setMood(m); setLog(null); toast(`Mood logged: ${m}.`); }}>{m}</button>)}</div>
        </FuturisticModal>
      )}
      {log === 'plan' && (
        <FuturisticModal title="Add to Wellness Plan" icon={Wind} onClose={() => setLog(null)}>
          <form className="stack" style={{ gap: 12 }} onSubmit={(e) => { e.preventDefault(); if (!newItem.title.trim()) return; setPlan((ps) => [...ps, { id: uid('w'), time: newItem.time, title: newItem.title, sub: 'Custom', icon: Brain, tone: 'cyan', done: false, area: 'Mindfulness' }]); setLog(null); toast('Added to your plan.'); }}>
            <HudInput label="Activity" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} autoFocus />
            <HudInput label="Time" value={newItem.time} onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} />
            <div className="row" style={{ justifyContent: 'flex-end' }}><NeonButton type="button" onClick={() => setLog(null)}>Cancel</NeonButton><NeonButton type="submit" variant="primary">Add</NeonButton></div>
          </form>
        </FuturisticModal>
      )}
    </div>
  );
}
