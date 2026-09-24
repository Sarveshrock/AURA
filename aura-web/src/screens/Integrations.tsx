import { useState } from 'react';
import {
  Plus, Download, Mic, Sparkles, Plane, Globe, Mail, ShoppingCart,
  Sun, Clock, Settings, Bot, Heart, Lock, Palette, Bell, Moon, Monitor, ShieldCheck, KeyRound, UserX,
} from 'lucide-react';
import { Hud, IconBox, PageHero, Toggle, AppLogo, toast, type Tone } from '../components/aura';

/* =================== INTEGRATIONS & SETTINGS =================== */

const appColor: Record<string, string> = {
  Gmail: '#ea4335', 'Google Calendar': '#4285f4', 'Google Drive': '#34a853', MakeMyTrip: '#e11d48', Swiggy: '#f97316', Zomato: '#dc2626',
  Uber: '#111827', Ola: '#facc15', IRCTC: '#1d4ed8', Flipkart: '#2563eb', Amazon: '#f59e0b',
};

export default function Integrations({ settingsFirst = false }: { settingsFirst?: boolean }) {
  const [apps, setApps] = useState<Record<string, boolean>>(Object.fromEntries(Object.keys(appColor).map((k) => [k, true])));
  const [rules, setRules] = useState([true, true, true]);
  const [theme, setTheme] = useState('Auto');
  const [prefs, setPrefs] = useState({ notif: true, daily: true });
  const [scope, setScope] = useState<string | null>(null);

  const privacy = (
    <Hud title="Privacy & Security" icon={ShieldCheck} sub="Your data is private and always under your control.">
      <div className="list">
        {[[Lock, 'Data Permissions', 'Manage what AURA can access', 'blue'], [KeyRound, 'End-to-End Encryption', 'Your data stays secure', 'green'], [Clock, 'Data Usage', 'View and manage your data', 'teal'], [Download, 'Export Data', 'Download everything AURA stores', 'violet'], [UserX, 'Delete Account', 'Permanently remove your data', 'red']].map(([I, t, s, tone]) => (
          <button key={t as string} className="li" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left' }} onClick={() => toast(t === 'Delete Account' ? 'Account deletion requires re-authentication and explicit confirmation.' : `${t as string} opens here.`)}>
            <IconBox icon={I as typeof Lock} tone={tone as Tone} size="sm" /><div className="grow"><div className="t-title">{t as string}</div><div className="t-sub">{s as string}</div></div>›
          </button>
        ))}
      </div>
    </Hud>
  );

  const appPrefs = (
    <Hud title="App Preferences" icon={Settings} sub="Customize AURA to match your style.">
      <div className="list">
        <div className="li"><Palette size={16} className="c-cyan" /><span className="grow">Theme</span><div className="row">{[[Sun, 'Light'], [Moon, 'Dark'], [Monitor, 'Auto']].map(([I, l]) => { const Ic = I as typeof Sun; return <button key={l as string} className={`chip ${theme === l ? 'active' : ''}`} onClick={() => setTheme(l as string)} aria-label={l as string}><Ic size={14} />{l === 'Auto' && ' Auto'}</button>; })}</div></div>
        <div className="li"><Globe size={16} className="c-cyan" /><span className="grow">Language</span><select className="select"><option>English</option><option>Hindi</option></select></div>
        <div className="li"><Mic size={16} className="c-cyan" /><span className="grow">Voice</span><select className="select"><option>AURA (Default)</option><option>ElevenLabs – Calm</option></select></div>
        <div className="li"><Sparkles size={16} className="c-cyan" /><span className="grow">Response Style</span><select className="select"><option>Balanced</option><option>Concise</option><option>Detailed</option></select></div>
        <div className="li"><Bot size={16} className="c-cyan" /><span className="grow">Default autonomy</span><select className="select"><option>L2 · Prepare</option><option>L1 · Suggest</option><option>L3 · Restricted Execute</option></select></div>
        <div className="li"><Bell size={16} className="c-cyan" /><span className="grow">Notifications</span><Toggle on={prefs.notif} onChange={(v) => setPrefs((p) => ({ ...p, notif: v }))} label="Notifications" /></div>
        <div className="li"><Mail size={16} className="c-cyan" /><span className="grow">Daily Summary Email</span><Toggle on={prefs.daily} onChange={(v) => setPrefs((p) => ({ ...p, daily: v }))} label="Daily summary" /></div>
      </div>
    </Hud>
  );

  return (
    <>
      <PageHero title={settingsFirst ? 'Settings &' : 'Integrations &'} accent={settingsFirst ? 'Control Center' : 'Settings'} lead="Connect your favorite apps and customize AURA for a truly personal experience. Least privilege, always revocable." quote="One AI. All your apps. A more organized you." />
      {settingsFirst && <div className="grid g2">{appPrefs}{privacy}</div>}
      <div className="with-rail">
        <Hud title="Connected Apps" icon={Settings} sub="Link your accounts to give AURA access to your data (with your permission)." action="Manage All">
          <div className="grid g3" style={{ gap: 10 }}>
            {Object.keys(appColor).map((n) => (
              <div className="tile row" key={n}>
                <AppLogo name={n} size={48} />
                <div style={{ flex: 1 }}>
                  <div className="t-title">{n}</div>
                  <button onClick={() => setScope(n)} style={{ background: 'none', border: 0, padding: 0, fontSize: 12 }} className={apps[n] ? 'c-green' : 't-mute'}>{apps[n] ? '● Connected' : 'Disconnected'} · scopes</button>
                </div>
                <Toggle on={apps[n]} onChange={(v) => { setApps((a) => ({ ...a, [n]: v })); toast(v ? `${n} connected (read-only scopes).` : `${n} access revoked.`); }} label={`Connect ${n}`} />
              </div>
            ))}
            <button className="tile hover row" onClick={() => toast('App directory opens here.')}><span className="icon-box lg c-cyan"><Plus size={22} /></span><div style={{ textAlign: 'left' }}><div className="t-title">Add More Apps</div><div className="t-sub">Connect new services</div></div></button>
          </div>
          {scope && (
            <div className="tile fade-in" style={{ marginTop: 12 }}>
              <div className="row between"><b>{scope} — permissions</b><button className="btn sm ghost" onClick={() => setScope(null)}>Close</button></div>
              <div className="row wrap" style={{ marginTop: 8 }}>{['read:profile', 'read:events', 'draft:create (approval)'].map((s) => <span className="tag cyan mono" key={s}>{s}</span>)}</div>
              <button className="btn sm danger" style={{ marginTop: 8 }} onClick={() => { setApps((a) => ({ ...a, [scope]: false })); setScope(null); toast(`${scope} access revoked.`); }}>Revoke access</button>
            </div>
          )}
        </Hud>
        <Hud title="Popular Integrations" action="View All" sub="Discover more apps to enhance your AI experience.">
          <div className="grid g3" style={{ gap: 8 }}>
            {[['Slack', 'Team communication', '#e01e5a'], ['Notion', 'Notes & productivity', '#e5e7eb'], ['Spotify', 'Music', '#1db954'], ['LinkedIn', 'Professional', '#0a66c2'], ['WhatsApp', 'Messaging', '#25d366'], ['YouTube', 'Learning', '#ff0000']].map(([n, s]) => (
              <div key={n} className="tile stack" style={{ alignItems: 'center', gap: 4, textAlign: 'center', padding: 10 }}>
                <AppLogo name={n} size={40} /><b style={{ fontSize: 13 }}>{n}</b><span className="t-mute" style={{ fontSize: 11 }}>{s}</span>
                <button className="btn sm block" onClick={() => toast(`${n}: OAuth consent screen opens here.`)}>Connect</button>
              </div>
            ))}
          </div>
        </Hud>
      </div>
      {!settingsFirst && (
        <div className="grid g3">
          <Hud title="Automation Rules" icon={Settings} sub="Smart automations that let AURA work in the background." action="View All">
            <div className="list">
              {[[Plane, 'Auto Book Flights', 'Prepare booking when price < ₹5,000 (you approve)'], [ShoppingCart, 'Reorder Groceries', 'Every month on the 5th'], [Heart, 'Period Care', 'Order essentials based on your cycle']].map(([I, t, s], i) => (
                <div className="li" key={t as string}><IconBox icon={I as typeof Plane} tone="amber" size="sm" /><div className="grow"><div className="t-title">{t as string}</div><div className="t-sub">{s as string}</div></div><Toggle on={rules[i]} onChange={(v) => setRules((r) => r.map((x, j) => (j === i ? v : x)))} label={t as string} /></div>
              ))}
            </div>
          </Hud>
          {privacy}
          {appPrefs}
        </div>
      )}
    </>
  );
}
