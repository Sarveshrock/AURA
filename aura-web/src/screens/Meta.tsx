import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Clock, IndianRupee, Plane, ShoppingCart, Utensils, ShoppingBag, CreditCard, MoreHorizontal, Leaf, BookOpen,
  Heart, Trophy, Timer, CheckCircle2, Crown, Users, Zap, Brain, ChevronRight, Sparkles, Rocket, CreditCard as Mail,
  LifeBuoy, Globe, UsersRound, ArrowRight, Infinity as InfinityIcon, Target, Send,
} from 'lucide-react';
import { Hud, IconBox, Bar, Donut, Legend, LineChart, BarChart, DemoFlag, PageHero, toast, type Tone } from '../components/aura';
import { agents } from '../data/mock';

/* =================== ANALYTICS =================== */

export function Analytics() {
  const nav = useNavigate();
  const [range, setRange] = useState('Last 30 days');
  const trend = [5, 8, 9, 7, 10, 12, 11, 13, 14, 13, 15, 16, 18, 17, 16, 19, 21, 22, 20, 23, 25, 24, 27, 28, 30, 29, 31, 33, 34, 36];
  const time = [
    { label: 'Travel', value: 32, color: '#3B82FF' }, { label: 'Shopping', value: 24, color: '#6366F1' }, { label: 'Research', value: 18, color: '#8B5CF6' },
    { label: 'Communication', value: 14, color: '#D946EF' }, { label: 'Finance', value: 8, color: '#F59E0B' }, { label: 'Others', value: 4, color: '#00E5FF' },
  ];
  const byAgent = ['travel', 'shopping', 'productivity', 'research', 'finance', 'wellness', 'communication', 'memory'].map((id) => agents.find((a) => a.id === id)!);
  const heat = Array.from({ length: 7 }, (_, r) => Array.from({ length: 24 }, (_, c) => (Math.sin(r * 3 + c * 0.7) + Math.cos(c * 0.45 + r)) * 0.5 + 0.5));

  return (
    <>
      <PageHero art="analytics" title="Analytics &" accent="Insights" lead="A personalized view of your activity, savings, and productivity." quote="Data into Decisions. Your Life, Optimized."
        right={<select className="select" value={range} onChange={(e) => setRange(e.target.value)}><option>Last 30 days</option><option>Last 7 days</option><option>This year</option></select>} />
      <div className="grid g4">
        {[[CalendarCheck, '24', 'Tasks Completed', '20%', 'pink'], [Clock, '15 hrs', 'Time Saved', '35%', 'cyan'], [IndianRupee, '₹12,450', 'Money Saved', '28%', 'green'], [Plane, '5', 'Trips Planned', '2 new', 'blue']].map(([I, v, l, d, t]) => (
          <div className="hud row" key={l as string}><IconBox icon={I as typeof Clock} tone={t as Tone} size="lg" /><div style={{ flex: 1 }}><b style={{ fontSize: 22 }}>{v as string}</b><div className="t-sub">{l as string}</div></div><div className="c-green" style={{ fontSize: 13, textAlign: 'right' }}>↑ {d as string}<div className="t-mute">vs. previous</div></div></div>
        ))}
      </div>
      <div className="grid g3">
        <Hud title="Task Completion Trend" icon={CalendarCheck}><LineChart values={trend} labels={['Sep 15', 'Sep 20', 'Sep 25', 'Sep 30', 'Oct 05', 'Oct 10', 'Oct 14']} height={200} /></Hud>
        <Hud title="Time Saved by Category" icon={Clock}><div className="row" style={{ gap: 16 }}><Donut data={time} center="15 hrs" sub="Saved" size={160} /><Legend data={time} /></div></Hud>
        <Hud title="Spending Insights" icon={IndianRupee}>
          <div className="stack" style={{ gap: 10 }}>
            {[[Plane, 'Travel', 18200, 'cyan'], [Utensils, 'Food & Delivery', 8450, 'violet'], [ShoppingBag, 'Shopping', 6780, 'pink'], [CreditCard, 'Subscriptions', 2990, 'amber'], [MoreHorizontal, 'Others', 1870, 'blue']].map(([I, l, v, t]) => {
              const Ic = I as typeof Plane;
              return <div className="row" key={l as string}><Ic size={15} className={`c-${t as string}`} /><span style={{ width: 110, fontSize: 13 }}>{l as string}</span><div style={{ flex: 1 }}><Bar value={((v as number) / 20000) * 100} tone={t as Tone} /></div><span className="mono" style={{ fontSize: 12 }}>₹{(v as number).toLocaleString('en-IN')}</span></div>;
            })}
            <div className="tile row" style={{ borderColor: 'rgba(34,197,94,0.5)' }}><Leaf className="c-green" /><div style={{ flex: 1 }}><b className="c-green">₹12,450 Saved</b><div className="t-sub">through better options & smart recommendations</div></div><span className="c-green">↑ 28%</span></div>
          </div>
        </Hud>
      </div>
      <div className="grid g3">
        <Hud title="Activity by Agent" icon={Users}>
          <BarChart values={[42, 36, 28, 24, 20, 18, 16, 12]} labels={byAgent.map((a) => a.name.split(' ')[0])} colors={['#3B82FF', '#8B5CF6', '#00E5FF', '#A855F7', '#00F5D4', '#EC4899', '#22D3EE', '#F59E0B']} showValues height={210} />
        </Hud>
        <Hud title="Goal Progress" icon={Target} action="View All">
          <div className="stack" style={{ gap: 14 }}>
            {[[Plane, 'Plan 3 trips this quarter', '2/3', 67, 'blue'], [BookOpen, 'Read 5 research papers', '3/5', 60, 'violet'], [Heart, 'Maintain daily workout', '18/30', 60, 'pink'], [IndianRupee, 'Save ₹50,000 this year', '₹12,450/₹50,000', 25, 'amber']].map(([I, l, s, v, t]) => (
              <div className="row" key={l as string}><IconBox icon={I as typeof Plane} tone={t as Tone} size="sm" /><div style={{ flex: 1 }}><div className="row between" style={{ fontSize: 12.5 }}><span>{l as string}</span><span className="t-sub">{s as string}</span></div><Bar value={v as number} tone={t as Tone} /></div><span className="mono t-sub">{v as number}%</span></div>
            ))}
          </div>
        </Hud>
        <Hud title="Productivity Heatmap" icon={CalendarCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(24, minmax(0,1fr))', gap: 3, fontSize: 11 }}>
            {heat.map((row, r) => (
              <Fragment key={r}>
                <span className="t-sub">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][r]}</span>
                {row.map((v, c) => <span key={c} title={`${Math.round(v * 100)}% active`} style={{ height: 13, borderRadius: 2, background: v > 0.85 ? '#00E5FF' : `rgba(59,130,255,${0.15 + v * 0.7})`, boxShadow: v > 0.85 ? '0 0 6px #00E5FF' : undefined }} />)}
              </Fragment>
            ))}
          </div>
          <div className="row t-mute" style={{ justifyContent: 'flex-end', marginTop: 8 }}>Less Active <span style={{ width: 60, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, rgba(59,130,255,0.2), #00E5FF)' }} /> More Active</div>
        </Hud>
      </div>
      <div className="grid auto-stack" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)' }}>
        <Hud title="Recent Achievements" icon={Trophy} action="View All">
          <div className="grid g4" style={{ gap: 8 }}>
            {[[Plane, 'Frequent Traveler', 'Planned 5 trips', 'green'], [Timer, 'Time Saver', 'Saved 10+ hours', 'violet'], [Heart, 'Wellness Streak', '7 days in a row', 'pink'], [Clock, 'Smart Spender', 'Saved ₹10,000+', 'blue']].map(([I, t, s, tone]) => (
              <div key={t as string} className="tile"><div className="row between"><IconBox icon={I as typeof Plane} tone={tone as Tone} size="sm" /><CheckCircle2 size={14} className="c-green" /></div><b style={{ fontSize: 13, display: 'block', marginTop: 6 }}>{t as string}</b><span className="t-mute">{s as string}</span></div>
            ))}
          </div>
        </Hud>
        <Hud title="Personal Insights" icon={Sparkles} action="Powered by AURA AI">
          <div className="grid g3" style={{ gap: 8 }}>
            {[[Plane, 'You usually book flights 3-4 weeks in advance. I found better prices for your next trip to Goa.', 'View Options', '/travel'], [ShoppingCart, 'You order groceries every 25 days. Shall I prepare your next order for next week?', 'Set Reminder', '/shopping'], [Heart, 'Your productivity is highest on Tuesday and Thursday. Schedule important tasks on these days.', 'Optimize Schedule', '/calendar']].map(([I, t, b, to]) => (
              <div key={b as string} className="tile stack" style={{ gap: 8 }}><IconBox icon={I as typeof Plane} tone="blue" /><span style={{ fontSize: 12.5 }}>{t as string}</span><button className="btn sm block" style={{ marginTop: 'auto' }} onClick={() => nav(to as string)}>{b as string}</button></div>
            ))}
          </div>
        </Hud>
      </div>
      <DemoFlag />
    </>
  );
}

/* =================== THANK YOU (ref 15) =================== */

export function ThankYou() {
  const nav = useNavigate();
  return (
    <>
      <div className="with-rail" style={{ gridTemplateColumns: 'minmax(0,1fr) 420px' }}>
        <div className="stack">
          <div className="hero ty-hero" style={{ alignItems: 'flex-start', padding: 0 }}>
            <div className="city" aria-hidden />
            <img className="scene" src="/aura/thankyou-scene.jpg" alt="AURA android seated at a desk in a night-city office" />
            <div style={{ flex: 1, textAlign: 'center', padding: '56px 28px 40px', marginLeft: 'min(38%, 360px)' }}>
              <h1 className="grad-cyan" style={{ fontSize: 'clamp(48px, 6.4vw, 92px)', lineHeight: 1 }}>Thank You</h1>
              <p style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', marginTop: 10 }}>For Exploring AURA</p>
              <p className="hero-quote" style={{ textAlign: 'center', marginTop: 22, fontSize: 21 }}>“More than an AI —<br />a partner in your everyday life.”</p>
              <div className="row wrap" style={{ justifyContent: 'center', gap: 26, marginTop: 30 }}>
                {[[Rocket, 'More Productive'], [Heart, 'More Balanced'], [Brain, 'More Informed'], [Leaf, 'A Better You']].map(([I, l]) => {
                  const Ic = I as typeof Heart;
                  return <div key={l as string} className="stack" style={{ alignItems: 'center', gap: 8, width: 92 }}><Ic size={36} strokeWidth={1.4} className="c-cyan" style={{ filter: 'drop-shadow(0 0 8px var(--aura-cyan))' }} /><span style={{ fontSize: 14, color: '#bfe9ff' }}>{l as string}</span></div>;
                })}
              </div>
            </div>
          </div>
          <div className="grid g3">
            <Hud corners><div className="row"><IconBox icon={Zap} tone="blue" size="lg" /><div><b style={{ fontSize: 16 }}>One Platform</b><div className="t-sub">All your apps, tasks, and goals in one place.</div></div></div></Hud>
            <Hud corners glow="violet"><div className="row"><IconBox icon={UsersRound} tone="violet" size="lg" /><div><b style={{ fontSize: 16 }}>Smarter Decisions</b><div className="t-sub">Personalized insights for a better you.</div></div></div></Hud>
            <Hud corners glow="cyan"><div className="row"><IconBox icon={InfinityIcon} tone="teal" size="lg" /><div><b style={{ fontSize: 16 }}>Endless Possibilities</b><div className="t-sub">A growing ecosystem of agents to support every part of your life.</div></div></div></Hud>
          </div>
        </div>
        <div className="stack">
          <Hud corners title={<span style={{ fontSize: 22 }}>Next Steps</span>} icon={ArrowRight}>
            <div className="stack" style={{ gap: 6 }}>
              {[['Try AURA', 'Start with your favorite agents and explore the possibilities.', '/dashboard', '#19E6FF'], ['Customize', 'Set your preferences, connect your apps, and make it truly yours.', '/onboarding', '#8B5CFF'], ['Upgrade (Optional)', 'Unlock Pro features for more power, more agents, and unlimited possibilities.', '/pricing', '#00E5A8']].map(([t, s, to, col], i, arr) => (
                <button key={t} className="row" style={{ background: 'none', border: 0, textAlign: 'left', alignItems: 'stretch', gap: 16 }} onClick={() => nav(to)}>
                  <div className="stack" style={{ alignItems: 'center', gap: 0 }}>
                    <span style={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `2.5px solid ${col}`, boxShadow: `0 0 14px ${col}`, fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</span>
                    {i < arr.length - 1 && <span style={{ flex: 1, width: 0, borderLeft: `2px dashed ${col}88`, minHeight: 24 }} />}
                  </div>
                  <div style={{ paddingTop: 4, paddingBottom: 14 }}><b style={{ fontSize: 17 }}>{t.replace(' (Optional)', '')}{t.includes('Optional') && <span className="c-cyan"> (Optional)</span>}</b><div className="t-sub" style={{ fontSize: 13.5 }}>{s}</div></div>
                </button>
              ))}
            </div>
          </Hud>
          <button className="hud glow-violet row" style={{ textAlign: 'left', padding: 20 }} onClick={() => nav('/pricing')}><Crown className="c-amber" size={34} style={{ filter: 'drop-shadow(0 0 8px var(--aura-warning))' }} /><div style={{ flex: 1 }}><b style={{ fontSize: 17 }}>Unlock Your Full Potential</b><div className="t-sub">Upgrade to AURA Pro and get access to advanced agents, deeper insights, and a smarter everyday life.</div></div><ChevronRight /></button>
          <Hud corners>
            <div className="row" style={{ marginBottom: 14 }}><IconBox icon={Send} tone="blue" size="lg" round /><div><b style={{ fontSize: 17 }}>Let's Stay Connected</b><div className="t-sub">We'd love to hear from you. Share feedback, request features, or just say hi!</div></div></div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[[Mail, 'Email Us'], [LifeBuoy, 'Support'], [Globe, 'Visit Website'], [UsersRound, 'Community']].map(([I, l]) => {
                const Ic = I as typeof Mail;
                return <button key={l as string} className="tile stack" style={{ alignItems: 'center', gap: 8, padding: '12px 4px' }} onClick={() => toast(`${l as string}: link not configured in demo.`)}><Ic size={26} strokeWidth={1.5} /><span style={{ fontSize: 11.5 }}>{l as string}</span></button>;
              })}
            </div>
          </Hud>
        </div>
      </div>
    </>
  );
}
