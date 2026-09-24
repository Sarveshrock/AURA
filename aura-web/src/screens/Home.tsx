import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, CalendarDays, IndianRupee, Mic, CalendarCheck, Tag, Plane, Utensils, Mail, SquarePlus, ShoppingCart,
  Bell, Moon, MoreVertical, MapPin, Droplets, Wind, Leaf, Search, Scale, BookOpen, LayoutGrid, Video, Presentation,
  Coffee, Phone, Dumbbell, CloudSun,
} from 'lucide-react';
import {
  AuraAvatar, Hud, Bar, Wave, DemoFlag, MetricCard, InsightCard, AgentCard, ActionCard, CommandInput, IconBox, StatusBadge, type Tone,
} from '../components/aura';
import { agents, user } from '../data/mock';

const schedule: { time: string; title: string; sub: string; tone: Tone; icon: typeof Video; online?: boolean }[] = [
  { time: '09:30 AM', title: 'Team Sync Meeting', sub: 'Online • 30 min', tone: 'green', icon: Video, online: true },
  { time: '11:00 AM', title: 'Project Review', sub: 'Conference Room', tone: 'amber', icon: Presentation },
  { time: '01:30 PM', title: 'Lunch Break', sub: 'Recommended by AURA', tone: 'amber', icon: Coffee },
  { time: '04:00 PM', title: 'Client Call', sub: 'Online • 1 hr', tone: 'blue', icon: Phone, online: true },
  { time: '07:00 PM', title: 'Gym', sub: 'Personal Goal', tone: 'green', icon: Dumbbell },
];

const insights: { icon: typeof Plane; tone: Tone; title: string; body: string; to: string }[] = [
  { icon: Plane, tone: 'cyan', title: 'Your flight is tomorrow', body: 'Check-in starts at 8:00 AM. Would you like me to prepare a checklist?', to: '/travel' },
  { icon: ShoppingCart, tone: 'amber', title: 'Price drop detected', body: 'Your saved headphones are 18% cheaper on Amazon now.', to: '/shopping' },
  { icon: Bell, tone: 'amber', title: 'Upcoming payment', body: 'Your electricity bill of ₹1,240 is due in 3 days.', to: '/finance' },
  { icon: Moon, tone: 'violet', title: 'You slept 5.5 hours yesterday', body: 'Consider sleeping earlier today for better performance.', to: '/wellness' },
];

const quick: { icon: typeof Plane; label: string; tone: Tone; to: string }[] = [
  { icon: Search, label: 'Find Products', tone: 'amber', to: '/shopping' },
  { icon: Scale, label: 'Compare Prices', tone: 'blue', to: '/shopping' },
  { icon: Plane, label: 'Plan Travel', tone: 'blue', to: '/travel' },
  { icon: Utensils, label: 'Order Food', tone: 'amber', to: '/chat?q=Order%20food' },
  { icon: CalendarCheck, label: 'Create Task', tone: 'blue', to: '/tasks' },
  { icon: Mail, label: 'Summarize Emails', tone: 'blue', to: '/chat?q=Summarize%20my%20emails' },
  { icon: BookOpen, label: 'Research', tone: 'violet', to: '/research' },
  { icon: LayoutGrid, label: 'Open Apps', tone: 'blue', to: '/integrations' },
];

const recent = [
  { agent: 'shopping', title: 'Shopping Agent', text: 'Compared 5 stores for iPhone 15', time: '2 min ago' },
  { agent: 'productivity', title: 'Productivity Agent', text: "Created reminder: 'Buy travel adapter'", time: '12 min ago' },
  { agent: 'finance', title: 'Finance Agent', text: 'Updated monthly spend', time: '1 hr ago' },
  { agent: 'communication', title: 'Communication Agent', text: 'Drafted email for client review', time: '2 hrs ago' },
];

const chips: [typeof Plane, string][] = [
  [CalendarCheck, 'Plan my day'], [Tag, 'Find best price'], [Plane, 'Prepare for travel'],
  [Utensils, 'Order food'], [Mail, 'Summarize emails'], [SquarePlus, 'Create a task'],
];

export default function Home() {
  const nav = useNavigate();
  const [ask, setAsk] = useState('');
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const go = (q: string) => nav(`/chat?q=${encodeURIComponent(q)}`);

  return (
    <>
      <div className="dash-hero">
        <div className="hero">
          <div className="copy" style={{ zIndex: 2 }}>
            <h2 style={{ fontSize: 28, fontWeight: 600 }}>{greet},</h2>
            <h1 className="grad-cyan" style={{ fontSize: 44 }}>{user.name}</h1>
            <p className="lead" style={{ fontSize: 16 }}>“Let's make today productive. I've analyzed your schedule, goals and current context.”</p>
            <p style={{ marginTop: 12, fontSize: 14 }}>You have <b className="c-cyan">3 important things</b> today. I detected <b className="c-amber">one schedule conflict</b>.</p>
            <div style={{ marginTop: 14 }}><Wave bars={26} /></div>
          </div>
          <div className="dash-portal">
            <AuraAvatar art="android" size={330} height={300} square />
          </div>
        </div>
        <Hud corners>
          <h3 style={{ fontSize: 21, fontWeight: 500, marginBottom: 12 }}>How can I help you today?</h3>
          <div className="row" style={{ justifyContent: 'center', margin: '4px 0 16px' }}>
            <button className="mic-btn" style={{ width: 78, height: 78 }} aria-label="Start voice mode" onClick={() => nav('/voice')}><Mic size={32} /></button>
          </div>
          <CommandInput value={ask} onChange={setAsk} onSubmit={go} placeholder="Ask anything..." />
          <div className="grid g3" style={{ marginTop: 12, gap: 8 }}>
            {chips.map(([I, l]) => <button key={l} className="chip" style={{ justifyContent: 'flex-start' }} onClick={() => go(l)}><I size={15} /> {l}</button>)}
          </div>
        </Hud>
      </div>

      <div className="grid g4">
        <MetricCard icon={Users} tone="cyan" value="8" label="Active Agents" onClick={() => nav('/agents')} />
        <MetricCard icon={Clock} tone="amber" value="5" label="Pending Actions" onClick={() => nav('/decisions')} />
        <MetricCard icon={CalendarDays} tone="blue" value="3" label="Upcoming Events" onClick={() => nav('/calendar')} />
        <MetricCard icon={IndianRupee} tone="cyan" value="₹12,450" label="Monthly Spend" onClick={() => nav('/finance')}
          extra={<div className="row" style={{ marginTop: 6 }}><div style={{ flex: 1 }}><Bar value={48} tone="green" /></div><span className="t-mute">48% of limit</span></div>} />
      </div>

      <div className="grid g3">
        <Hud title="Today's Schedule" action="View All" onAction={() => nav('/calendar')}>
          <div className="stack" style={{ gap: 0 }}>
            {schedule.map((s, i) => (
              <div className="row" key={s.time} style={{ alignItems: 'stretch', gap: 12 }}>
                <span className="mono t-sub" style={{ width: 66, fontSize: 12, paddingTop: 14, flexShrink: 0 }}>{s.time}</span>
                <div className="stack" style={{ gap: 0, alignItems: 'center', width: 10 }}>
                  <span style={{ width: 1.5, flex: 1, background: i ? 'var(--aura-primary)' : 'transparent', opacity: 0.6 }} />
                  <span className={`dot ${s.tone === 'amber' ? 'amber' : 'cyan'}`} />
                  <span style={{ width: 1.5, flex: 1, background: i < schedule.length - 1 ? 'var(--aura-primary)' : 'transparent', opacity: 0.6 }} />
                </div>
                <div className="li grow" style={{ padding: '9px 0' }}>
                  <IconBox icon={s.icon} tone={s.tone} size="sm" />
                  <div className="grow">
                    <div className="t-title">{s.title}</div>
                    <div className="t-sub" style={{ color: s.online ? 'var(--aura-green)' : undefined }}>{s.online && '◉ '}{s.sub}</div>
                  </div>
                  <MoreVertical size={15} className="t-mute" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </Hud>

        <Hud title="AURA Insights" action="See Details" onAction={() => nav('/decisions')}>
          <div className="stack" style={{ gap: 10 }}>
            {insights.map((i) => <InsightCard key={i.title} {...i} onClick={() => nav(i.to)} />)}
          </div>
        </Hud>

        <Hud title="Active Agents" action="Manage" onAction={() => nav('/agents')}>
          <div className="list">
            {agents.filter((a) => a.id !== 'core').slice(0, 8).map((a) => <AgentCard key={a.id} agent={a} compact onClick={() => nav(`/agents/${a.id}`)} />)}
          </div>
        </Hud>
      </div>

      <div className="grid g3">
        <Hud title="Quick Actions">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
            {quick.map((q) => <ActionCard key={q.label} {...q} onClick={() => nav(q.to)} />)}
          </div>
        </Hud>
        <Hud title="Recent Activity" action="View All" onAction={() => nav('/collaboration')}>
          <div className="list">
            {recent.map((r) => {
              const a = agents.find((x) => x.id === r.agent)!;
              return (
                <div className="li" key={r.text}>
                  <IconBox icon={a.icon} tone={a.tone} size="sm" />
                  <div className="grow"><div className="t-title">{r.title}</div><div className="t-sub ellipsis">{r.text}</div></div>
                  <span className="t-mute" style={{ whiteSpace: 'nowrap' }}>{r.time}</span>
                </div>
              );
            })}
          </div>
        </Hud>
        <Hud style={{ ['--fill' as string]: 'linear-gradient(180deg, rgba(20,48,110,0.75), rgba(8,18,40,0.9) 55%, rgba(4,10,22,0.96))' }}>
          <div className="row between"><span className="row"><MapPin size={16} className="c-cyan" /> {user.city}</span><span className="t-sub">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
          <div className="row" style={{ margin: '22px 0 2px', gap: 12 }}>
            <span style={{ fontSize: 56, fontWeight: 700, fontFamily: 'var(--font-head)' }}>24°C</span>
            <CloudSun size={42} className="c-cyan" style={{ filter: 'drop-shadow(0 0 8px var(--aura-cyan))' }} />
          </div>
          <div className="row between"><span style={{ fontSize: 17 }}>Partly Cloudy</span><span className="t-sub">Feels like 26°C</span></div>
          <div className="grid g3" style={{ marginTop: 20, gap: 8 }}>
            <span className="row t-sub"><Droplets size={16} /> 40%</span>
            <span className="row t-sub"><Wind size={16} /> 12 km/h</span>
            <span className="row t-sub"><Leaf size={16} /> Good</span>
          </div>
        </Hud>
      </div>
      <div className="row between wrap">
        <div className="row wrap"><StatusBadge status="online" label="Online" /><StatusBadge status="active" label="All Agents Active" /><StatusBadge status="completed" label="Synced" /></div>
        <DemoFlag />
      </div>
    </>
  );
}
