import { useMemo, useState } from 'react';
import { CalendarDays, CalendarRange, Calendar as CalIcon, ListChecks, ChevronLeft, ChevronRight, Plus, Sparkles, PlusCircle, Clock, RefreshCw, ChevronDown } from 'lucide-react';
import { Hud, IconBox, NeonButton, NeonTabs, PageHero, FuturisticModal, DemoFlag, toast, toneHex } from '../components/aura';
import { AICommandPanel, confirmActions, type AIReply } from '../components/ai';
import { CalendarGrid, MiniCalendar, EventModal, EventChip, DOW, toISO } from '../components/calendar';
import { kindMeta, DEMO_TODAY, type CalendarEvent } from '../data/mockEvents';
import { eventsStore } from '../state/stores';
import { uid } from '../state/store';
import { usePageSearch, matches } from '../state/search';

type View = 'Month' | 'Week' | 'Day' | 'Agenda';
const parseISO = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDay = (iso: string, o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) => parseISO(iso).toLocaleDateString('en-US', o);
const toMin = (t: string) => { const m = t.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i); if (!m) return -1; let h = Number(m[1]) % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + Number(m[2] ?? 0); };
const sortKey = (e: CalendarEvent) => `${e.date}${String(toMin(e.start) + 1).padStart(5, '0')}`;

interface ModalState { event?: CalendarEvent; date?: string; preset?: Partial<CalendarEvent> }

export default function Calendar() {
  const events = eventsStore.use();
  const q = usePageSearch();
  const [view, setView] = useState<View>('Month');
  const [cursor, setCursor] = useState(() => parseISO(DEMO_TODAY));
  const [sel, setSel] = useState(DEMO_TODAY);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [ai, setAi] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [monthMenu, setMonthMenu] = useState(false);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const shown = useMemo(() => events.filter((e) => matches(q, e.title, kindMeta[e.kind].label, e.notes)), [events, q]);
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const step = (dir: number) => {
    const d = new Date(cursor);
    if (view === 'Month' || view === 'Agenda') d.setMonth(d.getMonth() + dir, 1);
    else d.setDate(d.getDate() + (view === 'Week' ? 7 : 1) * dir);
    setCursor(d);
    if (view === 'Week' || view === 'Day') setSel(toISO(d.getFullYear(), d.getMonth(), d.getDate()));
  };
  const goToday = () => { setCursor(parseISO(DEMO_TODAY)); setSel(DEMO_TODAY); };
  const pickDay = (iso: string) => { setSel(iso); const d = parseISO(iso); if (d.getMonth() !== m || d.getFullYear() !== y) setCursor(d); };
  const shiftMonth = (dir: number) => { const d = new Date(y, m + dir, 1); setCursor(d); };

  const save = (data: Omit<CalendarEvent, 'id'>, id?: string) => {
    eventsStore.set((es) => (id ? es.map((e) => (e.id === id ? { ...data, id } : e)) : [...es, { ...data, id: uid('ev') }]));
    toast(id ? 'Event updated.' : `“${data.title}” added to ${fmtDay(data.date)}.`);
    setModal(null);
  };
  const remove = (id: string) => { eventsStore.set((es) => es.filter((e) => e.id !== id)); setModal(null); toast('Event deleted.'); };

  const weekDays = useMemo(() => {
    const s = parseISO(sel);
    s.setDate(s.getDate() - s.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(s); d.setDate(d.getDate() + i); return toISO(d.getFullYear(), d.getMonth(), d.getDate()); });
  }, [sel]);
  const upcoming = shown.filter((e) => e.date >= DEMO_TODAY).sort((a, b) => sortKey(a).localeCompare(sortKey(b))).slice(0, 4);
  const agenda = shown.filter((e) => { const d = parseISO(e.date); return d.getMonth() === m && d.getFullYear() === y; }).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  const aiHandler = (p: string): AIReply => {
    const t = p.toLowerCase();
    if (/focus/.test(t)) {
      const free = ['2025-10-15', '2025-10-17', '2025-10-21'].find((d) => !events.some((e) => e.date === d)) ?? '2025-10-22';
      return {
        text: `I found a free 2-hour window on ${fmtDay(free, { weekday: 'long', month: 'short', day: 'numeric' })}, 9:00–11:00 AM, with no meetings nearby.`,
        preview: [`Add “Focus Time” · ${fmtDay(free)} · 9:00 AM – 11:00 AM`],
        actions: confirmActions('Add focus block', () => { eventsStore.set((es) => [...es, { id: uid('ev'), title: 'Focus Time', date: free, start: '9:00 AM', end: '11:00 AM', kind: 'focus' }]); return `Focus Time added on ${fmtDay(free)}.`; }),
      };
    }
    if (/gym|workout|move/.test(t)) {
      const gym = events.find((e) => e.kind === 'fitness');
      if (!gym) return { text: 'I could not find a workout on your calendar.' };
      return {
        text: `Your ${gym.title} is at ${gym.start} on ${fmtDay(gym.date)}. I can move it to 7:00 PM so the morning stays free for deep work.`,
        preview: [`${gym.title}: ${gym.start} → 7:00 PM (${fmtDay(gym.date)})`],
        actions: confirmActions('Move workout', () => { eventsStore.set((es) => es.map((e) => (e.id === gym.id ? { ...e, start: '7:00 PM', end: '8:00 PM' } : e))); return `${gym.title} moved to 7:00 PM.`; }),
      };
    }
    const dayEvents = events.filter((e) => e.date === sel).sort((a, b) => toMin(a.start) - toMin(b.start));
    const list = dayEvents.length ? dayEvents.map((e) => `${e.start} ${e.title}`).join(', ') : 'nothing scheduled yet';
    return {
      text: `${fmtDay(sel, { weekday: 'long', month: 'long', day: 'numeric' })}: ${list}. I suggest a 45-minute prep block before your first commitment and a proper lunch break. Would you like me to optimize your schedule?`,
      preview: ['Add “Prep block” · 9:30 AM – 10:15 AM', 'Add “Lunch break” · 1:00 PM – 1:45 PM'],
      actions: [
        { label: 'Optimize My Day', variant: 'primary', run: () => {
          eventsStore.set((es) => [...es, { id: uid('ev'), title: 'Prep block', date: sel, start: '9:30 AM', end: '10:15 AM', kind: 'focus' }, { id: uid('ev'), title: 'Lunch break', date: sel, start: '1:00 PM', end: '1:45 PM', kind: 'personal' }]);
          return 'Added a prep block and a lunch break to your day.';
        } },
        { label: 'Keep Current Schedule', run: () => 'Okay — your schedule is unchanged.' },
      ],
    };
  };

  const quick: [typeof Clock, string, () => void][] = [
    [PlusCircle, 'Add Event', () => setModal({ date: sel })],
    [Clock, 'Focus Time', () => setModal({ date: sel, preset: { title: 'Focus Time', kind: 'focus', start: '9:00 AM', end: '11:00 AM' } })],
    [Sparkles, 'AI Plan My Day', () => setAi(true)],
    [RefreshCw, syncing ? 'Syncing…' : 'Sync Calendar', () => { setSyncing(true); setTimeout(() => { setSyncing(false); toast('Sync checked: Google Calendar is not connected (demo). Connect it in Integrations.'); }, 1200); }],
  ];

  return (
    <>
      <PageHero title="Calendar" lead="Plan smarter. Do more with AURA." image="/aura/hero-calendar.jpg" imageWidth="30%" quote="Your Schedule. Your Goals. A More Balanced You."
        right={
          <div className="stack" style={{ gap: 10, zIndex: 2 }}>
            <NeonButton icon={Plus} onClick={() => setModal({ date: sel })}>Add Event</NeonButton>
            <NeonButton icon={Sparkles} onClick={() => setAi(true)}>AI Schedule</NeonButton>
          </div>
        } />

      <div className="module">
        <div className="main">
          <div className="row between wrap">
            <NeonTabs tabs={['Month', 'Week', 'Day', 'Agenda'] as const} value={view} onChange={setView} icons={{ Month: CalendarDays, Week: CalendarRange, Day: CalIcon, Agenda: ListChecks }} />
            <div className="row">
              <button className="icon-btn" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft size={18} /></button>
              <NeonButton onClick={goToday}>Today</NeonButton>
              <button className="icon-btn" onClick={() => step(1)} aria-label="Next"><ChevronRight size={18} /></button>
              <div style={{ position: 'relative' }}>
                <NeonButton onClick={() => setMonthMenu((o) => !o)} aria-haspopup="listbox" aria-expanded={monthMenu} style={{ minWidth: 170 }}>{monthLabel} <ChevronDown size={15} /></NeonButton>
                {monthMenu && (
                  <ul className="menu" role="listbox" style={{ right: 0, maxHeight: 300, overflowY: 'auto' }}>
                    {Array.from({ length: 12 }, (_, i) => new Date(y, i, 1)).map((d) => (
                      <li key={d.getMonth()}><button role="option" aria-selected={d.getMonth() === m} onClick={() => { setCursor(d); setMonthMenu(false); }}>{d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</button></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {view === 'Month' && (
            <CalendarGrid y={y} m={m} events={shown} selected={sel} today={DEMO_TODAY}
              onSelectDay={(iso) => (iso === sel ? setModal({ date: iso }) : pickDay(iso))} onOpenEvent={(e) => setModal({ event: e })} />
          )}

          {view === 'Week' && (
            <Hud>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(7, minmax(96px,1fr))', gap: 8, overflowX: 'auto' }}>
                {weekDays.map((iso, i) => (
                  <div key={iso} className="tile stack" style={{ minHeight: 320, gap: 6, padding: 8, ['--bd' as string]: iso === DEMO_TODAY ? 'var(--aura-primary-bright)' : undefined }}>
                    <button onClick={() => setModal({ date: iso })} style={{ background: 'none', border: 0, textAlign: 'left', padding: 0 }} aria-label={`Add event on ${fmtDay(iso)}`}>
                      <div className="t-sub">{DOW[i]}</div><b style={{ fontSize: 18 }}>{parseISO(iso).getDate()}</b>
                    </button>
                    {shown.filter((e) => e.date === iso).sort((a, b) => toMin(a.start) - toMin(b.start)).map((e) => <EventChip key={e.id} ev={e} onClick={() => setModal({ event: e })} />)}
                  </div>
                ))}
              </div>
            </Hud>
          )}

          {view === 'Day' && (
            <Hud title={fmtDay(sel, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}>
              <div className="list">
                {shown.filter((e) => e.date === sel && e.start === 'All Day').map((e) => <div key={e.id} className="li"><span className="mono t-sub" style={{ width: 76 }}>All day</span><div style={{ width: 240 }}><EventChip ev={e} onClick={() => setModal({ event: e })} /></div></div>)}
                {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => {
                  const label = `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                  const evs = shown.filter((e) => e.date === sel && Math.floor(toMin(e.start) / 60) === h);
                  return (
                    <div className="li" key={h} style={{ minHeight: 48 }}>
                      <span className="mono t-sub" style={{ width: 76 }}>{label}</span>
                      <div className="row wrap grow">
                        {evs.map((e) => <div key={e.id} style={{ width: 240 }}><EventChip ev={e} onClick={() => setModal({ event: e })} /></div>)}
                        {!evs.length && <button className="t-mute" style={{ background: 'none', border: 0 }} onClick={() => setModal({ date: sel, preset: { start: label } })} aria-label={`Add event at ${label}`}>+ Add</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Hud>
          )}

          {view === 'Agenda' && (
            <Hud title={`Agenda · ${monthLabel}`}>
              <div className="list">
                {agenda.map((e) => {
                  const c = toneHex[kindMeta[e.kind].tone];
                  return (
                    <button key={e.id} className="li" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left' }} onClick={() => setModal({ event: e })}>
                      <span className="mono" style={{ width: 100 }}>{fmtDay(e.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="dot" style={{ background: c, color: c }} />
                      <span className="grow t-title">{e.title}</span>
                      <span className="t-sub">{e.start}{e.end ? ` – ${e.end}` : ''}</span>
                    </button>
                  );
                })}
                {!agenda.length && <div className="empty">No events this month{q ? ` matching “${q}”` : ''}.</div>}
              </div>
            </Hud>
          )}
          <DemoFlag label="DEMO CALENDAR — connect Google Calendar to sync" />
        </div>

        <div className="rail">
          <MiniCalendar y={y} m={m} selected={sel} events={events} onSelect={pickDay} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
          <Hud corners title="Upcoming Events" action="View All" onAction={() => setView('Agenda')}>
            <div className="list">
              {upcoming.map((e) => {
                const c = toneHex[kindMeta[e.kind].tone];
                return (
                  <button key={e.id} className="li" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left' }} onClick={() => setModal({ event: e })}>
                    <span className="dot" style={{ width: 14, height: 14, background: c, color: c }} />
                    <div className="grow"><div className="t-title">{e.title}</div><div className="t-sub">{e.date === DEMO_TODAY ? 'Today' : fmtDay(e.date)}, {e.start}{e.end ? ` – ${e.end}` : ''}</div></div>
                  </button>
                );
              })}
              {!upcoming.length && <div className="empty">Nothing upcoming.</div>}
            </div>
          </Hud>
          <Hud corners title="Quick Actions">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
              {quick.map(([I, l, fn]) => (
                <button key={l} className="stack" style={{ background: 'none', border: 0, alignItems: 'center', gap: 6, textAlign: 'center' }} onClick={fn} disabled={l === 'Syncing…'}>
                  <IconBox icon={I} tone="blue" size="lg" />
                  <span style={{ fontSize: 11.5 }}>{l}</span>
                </button>
              ))}
            </div>
          </Hud>
        </div>
      </div>

      {modal && (
        <EventModal key={modal.event?.id ?? `new-${modal.date}-${modal.preset?.title ?? ''}`} event={modal.event} date={modal.date} preset={modal.preset}
          onClose={() => setModal(null)} onDelete={modal.event ? () => remove(modal.event!.id) : undefined} onSave={(d) => save(d, modal.event?.id)} />
      )}

      {ai && (
        <FuturisticModal title="AI Schedule" icon={Sparkles} tone="violet" onClose={() => setAi(false)}>
          <AICommandPanel title="Plan with AURA" initialOpen
            description={`Working on ${fmtDay(sel, { weekday: 'long', month: 'long', day: 'numeric' })}. Changes are only made after you confirm.`}
            prompts={['Plan my day', 'Find a 2-hour focus block this week', 'Move my workout to the evening']} onAsk={aiHandler} placeholder="e.g. Plan my day" />
        </FuturisticModal>
      )}
    </>
  );
}
