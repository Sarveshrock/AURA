import { useMemo, useRef, useState } from 'react';
import {
  Plane, BedDouble, Train, Bus, Car, Briefcase, MapPinned, ArrowLeftRight, Users, Search, Compass, ShieldCheck, Sparkles, ClipboardList, Bell, Map,
  ChevronRight, CalendarDays, BadgeCheck, ArrowUpDown,
} from 'lucide-react';
import { Hud, PageHero, NeonButton, NeonTabs, IconBox, Drawer, Toggle, FuturisticModal, DemoFlag, toast, type Tone } from '../components/aura';
import { AICommandPanel, confirmActions, type AIReply } from '../components/ai';
import { DestinationCard, DealCard } from '../components/travel';
import { mockDestinations, mockDeals, mockFlights, mockBookings, mockItinerary, type FlightResult } from '../data/mockTrips';
import { usePageSearch, matches } from '../state/search';

const MODES = ['Flights', 'Hotels', 'Trains', 'Buses', 'Cabs', 'Packages', 'Activities'] as const;
type Mode = (typeof MODES)[number];
const modeIcon = { Flights: Plane, Hotels: BedDouble, Trains: Train, Buses: Bus, Cabs: Car, Packages: Briefcase, Activities: MapPinned };
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface Result { id: string; title: string; sub: string; meta: string; price: number }

function resultsFor(mode: Mode, from: string, to: string): Result[] {
  if (mode === 'Flights') return mockFlights(from, to).map((f: FlightResult) => ({ id: f.id, title: `${f.airline} ${f.code}`, sub: `${f.dep} → ${f.arr} · ${f.dur}`, meta: f.stops, price: f.price }));
  const city = to.replace(/\s*\(.*\)/, '');
  const base: Record<Exclude<Mode, 'Flights'>, [string, string, number][]> = {
    Hotels: [[`Taj Holiday Village, ${city}`, '4.6 ★ · Beachfront', 7800], [`Novotel ${city}`, '4.3 ★ · Pool', 5400], [`Zostel ${city}`, '4.4 ★ · Hostel', 1200]],
    Trains: [['Konkan Kanya Express', '23:05 → 10:40 · Sleeper', 820], ['Mandovi Express', '07:10 → 19:05 · 3A', 1450]],
    Buses: [['Neeta Travels Volvo', '21:30 → 07:30 · AC Sleeper', 1350], ['Paulo Travels', '20:00 → 06:15 · AC Seater', 950]],
    Cabs: [['Uber Premier', 'Pickup in 6 min', 1240], ['Ola Mini', 'Pickup in 4 min', 890]],
    Packages: [[`${city} 4N/5D Explorer`, 'Flights + hotel + transfers', 18999], [`${city} Weekend Escape`, 'Hotel + activities', 9999]],
    Activities: [['Sunset cruise', '2 hrs · Evening', 1500], ['Scuba diving intro', '3 hrs · Morning', 3500], ['Old town walking tour', '2 hrs', 800]],
  };
  return base[mode as Exclude<Mode, 'Flights'>].map(([t, s, p], i) => ({ id: `${mode}${i}`, title: t, sub: s, meta: mode, price: p }));
}

export default function Travel() {
  const q = usePageSearch();
  const [mode, setMode] = useState<Mode>('Flights');
  const [trip, setTrip] = useState<'One Way' | 'Round Trip' | 'Multi-City'>('One Way');
  const [from, setFrom] = useState('Pune (PNQ)');
  const [to, setTo] = useState('Goa (GOI)');
  const [dep, setDep] = useState('2025-10-24');
  const [ret, setRet] = useState('2025-10-28');
  const [pax, setPax] = useState(1);
  const [cabin, setCabin] = useState<'Economy' | 'Business'>('Economy');
  const [paxOpen, setPaxOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');
  const [liked, setLiked] = useState<string[]>(['goa']);
  const [book, setBook] = useState<{ title: string; lines: string[] } | null>(null);
  const [drawer, setDrawer] = useState<'bookings' | 'reminders' | 'itinerary' | null>(null);
  const [reminders, setReminders] = useState({ checkin: true, docs: true, weather: false, leave: true });
  const formRef = useRef<HTMLDivElement>(null);

  const dests = mockDestinations.filter((d) => matches(q, d.name, d.tags));
  const sorted = useMemo(() => results && [...results].sort((a, b) => (sortBy === 'price' ? a.price - b.price : a.title.localeCompare(b.title))), [results, sortBy]);
  const fields = {
    Flights: ['From', 'To', 'Departure', 'Return'], Hotels: ['City', '—', 'Check-in', 'Check-out'], Trains: ['From', 'To', 'Journey', '—'], Buses: ['From', 'To', 'Journey', '—'],
    Cabs: ['Pickup', 'Drop', 'Date', '—'], Packages: ['Leaving from', 'Destination', 'Start', 'End'], Activities: ['City', '—', 'Date', '—'],
  }[mode];

  const search = () => {
    if (!to.trim() || (fields[0] !== '—' && !from.trim())) { toast('Enter where you are going.'); return; }
    setSearching(true);
    setResults(null);
    setTimeout(() => { setSearching(false); setResults(resultsFor(mode, from, to)); }, 900);
  };

  const ai = (p: string): AIReply => {
    const t = p.toLowerCase();
    if (/goa/.test(t)) {
      return { text: 'Here is a 5-day Goa plan within ₹20,000 for 1 traveller, built from current demo fares:',
        preview: ['Flights PNQ ⇄ GOI · ₹6,400', 'Stay 4 nights (Zostel / 3★) · ₹6,000', 'Local scooter + cabs · ₹2,500', 'Activities & food · ₹4,800', 'Total ≈ ₹19,700 — within budget'],
        actions: confirmActions('Save trip plan', () => { setTo('Goa (GOI)'); setDrawer('itinerary'); return 'Goa trip plan saved. Bookings still need your approval.'; }) };
    }
    if (/europe/.test(t)) {
      return { text: 'A balanced 7-day Europe route with short hops:', preview: ['Day 1–2 · Paris (Eiffel, Louvre)', 'Day 3–4 · Amsterdam (canals, museums)', 'Day 5–6 · Prague (old town)', 'Day 7 · Return from Prague', 'Estimated ₹1.4–1.8L incl. flights'],
        actions: confirmActions('Save to Memory', () => 'Europe itinerary saved to your travel memories.') };
    }
    if (/weekend|pune/.test(t)) {
      return { text: 'Three weekend ideas within 3 hours of Pune:', preview: ['Lonavala · 1.5 h · hills & forts', 'Mahabaleshwar · 3 h · strawberries & viewpoints', 'Alibaug · 3 h · beaches (ferry option)'],
        actions: [{ label: 'Plan Mahabaleshwar', variant: 'primary', run: () => { setMode('Hotels'); setFrom('Pune'); setTo('Mahabaleshwar'); formRef.current?.scrollIntoView({ behavior: 'smooth' }); return 'Search set up for Mahabaleshwar hotels.'; } }, { label: 'Cancel', run: () => 'Okay.' }] };
    }
    const dest = mockDestinations.find((d) => t.includes(d.name.toLowerCase()));
    if (dest) return { text: `${dest.name} (${dest.tags}) starts from ${inr(dest.from)}. Want me to search flights?`, actions: [{ label: 'Search flights', variant: 'primary', run: () => { setMode('Flights'); setTo(dest.code); setTimeout(search, 0); return `Searching flights to ${dest.name}…`; } }, { label: 'Cancel', run: () => 'Okay.' }] };
    return { text: 'Tell me a destination, dates or budget — e.g. “Plan a 5 day Goa trip under ₹20K”.' };
  };

  return (
    <div className="module">
      <div className="main">
        <PageHero title={<>Travel <span className="grad">Smarter</span></>} lead="Plan, book, and manage your entire journey with AURA." image="/aura/hero-travel.jpg" imageWidth="48%"
          quote="AURA turns travel plans into unforgettable experiences."
          feats={[
            { icon: Plane, title: 'Best deals', sub: 'Flights, hotels, trains' },
            { icon: BedDouble, title: 'Personalized trips', sub: 'Based on your preferences', tone: 'violet' },
            { icon: Compass, title: 'AI itineraries', sub: 'Save time and explore more', tone: 'cyan' },
            { icon: ShieldCheck, title: 'Real-time support', sub: 'During your journey', tone: 'teal' },
          ]} />

        <div ref={formRef}><NeonTabs tabs={MODES} value={mode} onChange={(m) => { setMode(m); setResults(null); }} icons={modeIcon} stretch /></div>

        <Hud corners>
          {mode === 'Flights' && <div style={{ marginBottom: 14 }}><NeonTabs tabs={['One Way', 'Round Trip', 'Multi-City'] as const} value={trip} onChange={setTrip} /></div>}
          <div className="grid auto-stack" style={{ gridTemplateColumns: fields[1] === '—' ? 'minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr) auto' : 'minmax(0,1.3fr) auto minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) auto', gap: 10, alignItems: 'end' }}>
            {fields[1] !== '—' ? (
              <>
                <div className="field"><label htmlFor="tv-from">{fields[0]}</label><div className="input"><Plane size={18} /><input id="tv-from" value={from} onChange={(e) => setFrom(e.target.value)} /></div></div>
                <button className="icon-btn" style={{ marginBottom: 4 }} onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap origin and destination"><ArrowLeftRight size={17} /></button>
                <div className="field"><label htmlFor="tv-to">{fields[1]}</label><div className="input"><Plane size={18} style={{ transform: 'rotate(45deg)' }} /><input id="tv-to" value={to} onChange={(e) => setTo(e.target.value)} /></div></div>
              </>
            ) : (
              <div className="field"><label htmlFor="tv-to">{fields[0]}</label><div className="input"><MapPinned size={18} /><input id="tv-to" value={to} onChange={(e) => setTo(e.target.value)} /></div></div>
            )}
            <div className="field"><label htmlFor="tv-dep">{fields[2]}</label><div className="input"><input id="tv-dep" type="date" value={dep} onChange={(e) => setDep(e.target.value)} /></div></div>
            {fields[3] !== '—' && <div className="field"><label htmlFor="tv-ret">{fields[3]}</label><div className="input"><input id="tv-ret" type="date" value={ret} min={dep} onChange={(e) => setRet(e.target.value)} disabled={mode === 'Flights' && trip === 'One Way'} /></div></div>}
            <div style={{ position: 'relative' }}>
              <button className="input" style={{ width: '100%', minWidth: 170 }} onClick={() => setPaxOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={paxOpen}>
                <Users size={20} /><span style={{ textAlign: 'left', flex: 1, color: '#fff' }}>{pax} Traveler{pax > 1 ? 's' : ''}<br /><small className="t-sub">{cabin}</small></span><ChevronRight size={16} />
              </button>
              {paxOpen && (
                <div className="menu" style={{ right: 0, padding: 12, minWidth: 220 }} role="dialog" aria-label="Travelers">
                  <div className="row between"><span>Travelers</span><span className="row"><button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setPax((n) => Math.max(1, n - 1))} aria-label="Fewer travelers">−</button><b>{pax}</b><button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setPax((n) => Math.min(9, n + 1))} aria-label="More travelers">+</button></span></div>
                  <div className="seg" style={{ marginTop: 10 }}>{(['Economy', 'Business'] as const).map((c) => <button key={c} className={`chip ${cabin === c ? 'active' : ''}`} onClick={() => setCabin(c)}>{c}</button>)}</div>
                  <NeonButton size="sm" block style={{ marginTop: 10 }} onClick={() => setPaxOpen(false)}>Done</NeonButton>
                </div>
              )}
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <NeonButton variant="ai" size="lg" onClick={search} disabled={searching}>{searching ? <span className="spinner" /> : <Search size={18} />} Search {mode}</NeonButton>
          </div>
          {sorted && (
            <div className="fade-in" style={{ marginTop: 14 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <b>{sorted.length} {mode.toLowerCase()} for {to}</b>
                <button className="chip" onClick={() => setSortBy((s) => (s === 'price' ? 'name' : 'price'))}><ArrowUpDown size={14} /> Sort: {sortBy === 'price' ? 'Lowest price' : 'Name'}</button>
              </div>
              <div className="list">
                {sorted.map((r, i) => {
                  const Icon = modeIcon[mode];
                  return (
                    <div className="li" key={r.id}>
                      <IconBox icon={Icon} tone={i === 0 && sortBy === 'price' ? 'green' : 'blue'} size="sm" />
                      <div className="grow"><div className="t-title">{r.title} {i === 0 && sortBy === 'price' && <span className="tag green">Lowest</span>}</div><div className="t-sub mono">{r.sub} · {r.meta}</div></div>
                      <b style={{ fontSize: 16 }}>{inr(r.price * (mode === 'Flights' ? pax : 1))}</b>
                      <NeonButton size="sm" variant="primary" onClick={() => setBook({ title: r.title, lines: [`${mode}: ${r.title}`, r.sub, `${from ? `${from} → ` : ''}${to} · ${dep}${mode === 'Flights' && trip !== 'One Way' ? ` – ${ret}` : ''}`, `${pax} traveler(s) · ${cabin}`, `Total ${inr(r.price * (mode === 'Flights' ? pax : 1))}`] })}>Book</NeonButton>
                    </div>
                  );
                })}
              </div>
              <DemoFlag label="DEMO FARES — booking requires approval + provider hand-off" />
            </div>
          )}
        </Hud>

        <Hud corners>
          <h2 className="section-title" style={{ marginBottom: 14 }}>Popular Destinations</h2>
          <div className="grid g5" style={{ gap: 12 }}>
            {dests.map((d) => (
              <DestinationCard key={d.id} d={d} liked={liked.includes(d.id)} onLike={() => setLiked((l) => (l.includes(d.id) ? l.filter((x) => x !== d.id) : [...l, d.id]))}
                onPick={() => { setMode('Flights'); setTo(d.code); setResults(null); formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast(`Destination set to ${d.name}. Press Search.`); }} />
            ))}
          </div>
          {!dests.length && <div className="empty">No destinations match “{q}”.</div>}
        </Hud>

        <Hud corners title="Exclusive Travel Deals" action="See All" onAction={() => toast('Showing all 4 demo deals.')}>
          <div className="grid g4" style={{ gap: 12 }}>
            {mockDeals.map((d) => <DealCard key={d.id} deal={d} onBook={() => setBook({ title: d.name, lines: [d.name, d.offer, 'Package includes flights + stay (demo)'] })} />)}
          </div>
        </Hud>
      </div>

      <div className="rail">
        <AICommandPanel title="AI Trip Planner" description="Tell me where you want to go and I'll create a personalized itinerary with flights, stays, activities and more."
          prompts={['Plan a 5 day Goa trip under ₹20K', 'Suggest a 7 day Europe itinerary', 'Plan a weekend trip from Pune']} promptStyle="boxes"
          onAsk={ai} cta="Plan My Trip with AI" ctaIcon={Sparkles} placeholder="Where do you want to go?" />

        <Hud corners title="Upcoming Trip" action="View All" onAction={() => setDrawer('bookings')}>
          <button className="row" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left', gap: 12 }} onClick={() => setDrawer('itinerary')}>
            <span className="media" style={{ width: 90, height: 96, flexShrink: 0 }}><img src="/aura/p/trip-goa.jpg" alt="Goa" /></span>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 16 }}>Goa Trip</b>
              <div className="t-sub">Oct 24 – Oct 28, 2025</div>
              <div className="t-sub">4 Days • 2 Travelers</div>
              <div className="row" style={{ marginTop: 6 }}><Plane size={16} className="c-cyan" /><BedDouble size={16} className="c-cyan" /><span className="tag green">Confirmed</span></div>
            </div>
            <ChevronRight size={18} />
          </button>
        </Hud>
        {([['bookings', ClipboardList, 'My Bookings', 'View and manage all trips', 'blue'], ['reminders', Bell, 'Travel Reminders', 'Get alerts for flights, check-in, etc.', 'magenta'], ['itinerary', Map, 'Travel Itinerary', 'Day-wise plan and activities', 'cyan']] as const).map(([k, I, t, s, tone]) => (
          <button key={k} className="hud row" style={{ textAlign: 'left', gap: 14 }} onClick={() => setDrawer(k)}>
            <IconBox icon={I} tone={tone as Tone} size="lg" />
            <div style={{ flex: 1 }}><div className="t-title" style={{ fontSize: 15 }}>{t}</div><div className="t-sub">{s}</div></div>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>

      <Drawer title="My Bookings" icon={ClipboardList} open={drawer === 'bookings'} onClose={() => setDrawer(null)}>
        {mockBookings.map((b) => (
          <div key={b.id} className="tile row"><BadgeCheck size={20} className={b.status === 'Confirmed' ? 'c-green' : 'c-amber'} /><div style={{ flex: 1 }}><b>{b.title}</b><div className="t-sub">{b.detail}</div></div><span className={`tag ${b.status === 'Confirmed' ? 'green' : 'amber'}`}>{b.status}</span></div>
        ))}
        <DemoFlag />
      </Drawer>
      <Drawer title="Travel Reminders" icon={Bell} open={drawer === 'reminders'} onClose={() => setDrawer(null)}>
        {([['checkin', 'Web check-in opens (48 h before)'], ['docs', 'Carry ID & booking PDFs'], ['weather', 'Weather alerts for Goa'], ['leave', 'Leave for airport (traffic-aware)']] as const).map(([k, l]) => (
          <div key={k} className="tile row between"><span>{l}</span><Toggle on={reminders[k]} onChange={(v) => setReminders((r) => ({ ...r, [k]: v }))} label={l} /></div>
        ))}
      </Drawer>
      <Drawer title="Travel Itinerary · Goa" icon={Map} open={drawer === 'itinerary'} onClose={() => setDrawer(null)}>
        {mockItinerary.map((d) => (
          <div key={d.day} className="tile"><b className="row"><CalendarDays size={15} className="c-cyan" /> {d.day}</b><ul style={{ margin: '6px 0 0', paddingLeft: 20 }} className="t-sub">{d.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
        ))}
      </Drawer>

      {book && (
        <FuturisticModal title="Approval required" icon={ShieldCheck} tone="amber" onClose={() => setBook(null)}>
          <p style={{ marginBottom: 10 }}>AURA will book: <b>{book.title}</b></p>
          <ul className="t-sub" style={{ margin: '0 0 12px', paddingLeft: 18, lineHeight: 1.8 }}>{book.lines.map((l) => <li key={l}>{l}</li>)}</ul>
          <p className="t-mute" style={{ marginBottom: 16 }}>Nothing is booked until you approve. In demo mode no provider is connected, so nothing will be charged.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <NeonButton variant="danger" onClick={() => setBook(null)}>Cancel</NeonButton>
            <NeonButton variant="primary" onClick={() => { setBook(null); toast('Demo: booking hand-off prepared. Not booked — no provider connected.'); }}>Approve</NeonButton>
          </div>
        </FuturisticModal>
      )}
    </div>
  );
}
