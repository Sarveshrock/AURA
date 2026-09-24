import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AudioLines, CalendarDays, Utensils, Plane, Mail, FileText, MapPin, Target, Globe, Gauge, Volume2, VolumeX, ChevronRight, Mic,
  X, Send, Sun, Radar, Workflow, Grid2x2, HelpCircle, SquareCheck, MessageSquare, Camera, Keyboard, Settings, Lightbulb,
} from 'lucide-react';
import { AuraAvatar, Hud, Wave, StatusBadge, VoiceVisualizer, NeonButton, type AuraState } from '../components/aura';
import { browserVoice } from '../services/voice';
import { user } from '../data/mock';

const commands = [
  [CalendarDays, 'Plan my day'], [Utensils, 'Find best food nearby'], [Plane, 'Book a flight to Goa'], [Mail, 'Summarize my emails'],
  [FileText, 'Prepare for my interview'], [CalendarDays, "What's on my calendar?"], [MapPin, 'Give me a travel plan'], [Target, 'Help me focus'],
] as const;

const understands = [[Sun, 'Natural Conversation'], [Radar, 'Context Awareness'], [Workflow, 'Multi-Agent Actions'], [Grid2x2, 'App Integration'], [HelpCircle, 'Follow-up Questions']] as const;

const suggested = [
  [CalendarDays, 'Plan my day'], [Plane, 'Find travel options'], [SquareCheck, 'Create a task'], [Target, 'Show my goals'],
  [Utensils, 'Order lunch for me'], [Mail, 'Summarize emails'], [MessageSquare, 'Read my messages'], [Camera, 'Open camera'],
] as const;

const settings = [[Globe, 'Language', 'English'], [AudioLines, 'Voice', 'AURA (Default)'], [Gauge, 'Speed', 'Normal'], [Volume2, 'Wake Word', 'Hey AURA']] as const;

interface Line { who: 'You' | 'AURA'; text: string; t: string }

export default function Voice() {
  const nav = useNavigate();
  const [state, setState] = useState<AuraState>('idle');
  const [muted, setMuted] = useState(false);
  const [draft, setDraft] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { who: 'You', text: 'I have an interview tomorrow in Bangalore. Help me plan everything.', t: '00:04' },
    { who: 'AURA', text: "Got it. I'll create a complete plan for your interview, including travel, preparation time, and checklist.", t: '00:06' },
  ]);
  const stopRef = useRef<(() => void) | null>(null);
  const started = useRef(Date.now());
  const stamp = () => {
    const s = Math.floor((Date.now() - started.current) / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const respond = (text: string) => {
    setState('thinking');
    setTimeout(() => {
      const reply = `Understood — "${text}". I'm coordinating the right agents and will show you options before anything is executed.`;
      setLines((l) => [...l, { who: 'AURA', text: reply, t: stamp() }]);
      setState('speaking');
      if (!muted) browserVoice.speak(reply);
      setTimeout(() => setState('idle'), 2600);
    }, 1100);
  };

  const commit = (text: string) => {
    if (!text.trim()) return;
    stopRef.current?.();
    setLines((l) => [...l, { who: 'You', text, t: stamp() }]);
    setDraft('');
    respond(text);
  };

  const toggleListen = () => {
    if (state === 'listening') { stopRef.current?.(); if (!browserVoice.supported) setState('idle'); return; }
    setState('listening');
    setDraft('');
    if (!browserVoice.supported) return; // fallback: type into the field and press Send
    let finalText = '';
    stopRef.current = browserVoice.listen(
      (t, final) => { setDraft(t); if (final) finalText = t; },
      () => { stopRef.current = null; if (finalText) commit(finalText); else setState('idle'); },
    );
  };

  const cancel = () => { stopRef.current?.(); setState('idle'); setDraft(''); };
  const listening = state === 'listening';
  const status = { listening: "I'm listening…", thinking: 'Thinking…', speaking: 'Speaking…' } as Partial<Record<AuraState, string>>;

  return (
    <>
      <div className="row between wrap">
        <div className="tile row" style={{ ['--c' as string]: '14px', padding: '12px 28px', gap: 16, ['--shape' as string]: 'polygon(20px 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0 50%)' }}>
          <AudioLines size={22} className="c-cyan" />
          <h1 style={{ fontFamily: 'var(--font-display)', letterSpacing: 3, fontSize: 20 }}>VOICE MODE</h1>
          <AudioLines size={22} className="c-cyan" />
        </div>
        <div className="row">
          <span className="pill-status"><span className="dot pulse" /> Online</span>
          <button className="icon-btn" aria-label="Voice settings" onClick={() => nav('/settings')}><Settings size={18} /></button>
        </div>
      </div>

      <div className="voice-grid">
        <div className="stack">
          <Hud corners title={<span className="hud-label" style={{ fontSize: 13 }}>Voice Commands</span>} icon={AudioLines}>
            <div className="list">
              {commands.map(([I, t]) => (
                <button key={t} className="li" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left', fontSize: 14.5 }} onClick={() => commit(t)}>
                  <I size={18} className="c-cyan" /> “{t}”
                </button>
              ))}
            </div>
          </Hud>
          <Hud corners title={<span className="hud-label" style={{ fontSize: 13 }}>AURA Understands</span>}>
            <div className="list">
              {understands.map(([I, t]) => <div className="li" key={t} style={{ fontSize: 14.5 }}><I size={20} className="c-cyan" /> {t}</div>)}
            </div>
          </Hud>
        </div>

        <div className="voice-center">
          <AuraAvatar art="voice" size={380} height={460} square state={state} />
          <div className="hud corners mic-hex">
            <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
              <Wave bars={10} idle={!listening && state !== 'speaking'} />
              <button className={`mic-btn ${listening ? 'live' : ''}`} onClick={toggleListen} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Tap to speak'}>
                <Mic size={38} />
              </button>
              <Wave bars={10} idle={!listening && state !== 'speaking'} />
            </div>
            <div style={{ fontSize: 22, marginTop: 10, fontWeight: 600 }}>{listening ? 'Listening…' : 'Tap to Speak'}</div>
            <div className="t-sub" aria-live="polite">{status[state] ?? "I'm listening..."}</div>
            {listening && (
              <div className="input" style={{ marginTop: 12, height: 42 }}>
                <input placeholder={browserVoice.supported ? 'Speak now…' : 'Type your command'} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && commit(draft)} autoFocus={!browserVoice.supported} aria-label="Transcript" />
              </div>
            )}
          </div>
          <div className="row voice-actions" style={{ gap: 14 }}>
            <NeonButton variant="danger" onClick={cancel}><X size={22} /> Cancel</NeonButton>
            <NeonButton onClick={() => setMuted((m) => !m)} aria-pressed={muted}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />} {muted ? 'Muted' : 'Mute'}</NeonButton>
            <NeonButton onClick={() => nav('/chat')}><Keyboard size={20} /> Text</NeonButton>
            <NeonButton variant="success" onClick={() => commit(draft)} disabled={!draft}><Send size={20} /> Send</NeonButton>
          </div>
        </div>

        <div className="stack">
          <Hud corners title={<span className="row hud-label" style={{ fontSize: 13 }}><span className="dot cyan pulse" /> Real-time Listening</span>}>
            <VoiceVisualizer active={listening || state === 'speaking'} label={listening ? 'Listening…' : state === 'speaking' ? 'Speaking…' : 'Standby'} />
          </Hud>
          <Hud corners title={<span className="hud-label" style={{ fontSize: 13 }}>Speech Settings</span>}>
            <div className="list">
              {settings.map(([I, k, v]) => (
                <button key={k} className="li" style={{ background: 'none', border: 0, width: '100%' }} onClick={() => nav('/settings')}>
                  <I size={18} className="c-cyan" /><span className="grow" style={{ textAlign: 'left' }}>{k}</span><span className="t-sub">{v}</span><ChevronRight size={14} />
                </button>
              ))}
            </div>
            <div className="t-mute" style={{ marginTop: 6 }}>Provider: {browserVoice.supported ? 'Browser (local)' : 'Unavailable here'} · Vapi / ElevenLabs via server</div>
          </Hud>
          <Hud corners title={<span className="hud-label" style={{ fontSize: 13 }}>Live Transcription</span>}>
            <div className="stack" style={{ gap: 14, maxHeight: 280, overflowY: 'auto' }}>
              {lines.map((l, i) => (
                <div className="row" key={i} style={{ alignItems: 'flex-start' }}>
                  {l.who === 'You' ? <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{user.initials}</div> : <span className="icon-box sm round c-cyan" style={{ fontWeight: 800 }}>A</span>}
                  <div style={{ flex: 1 }}>
                    <div className="row between"><span className={l.who === 'AURA' ? 'c-cyan' : 't-sub'} style={{ fontSize: 12 }}>{l.who}</span><span className="t-mute mono">{l.t}</span></div>
                    <div style={{ fontSize: 13.5 }}>{l.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Hud>
        </div>
      </div>

      <Hud corners title={<span className="row hud-label" style={{ fontSize: 13 }}><Lightbulb size={16} /> Suggested Voice Commands</span>}>
        <div className="grid g4" style={{ gap: 10 }}>
          {suggested.map(([I, t]) => <button key={t} className="chip" style={{ padding: '13px 14px', fontSize: 13.5 }} onClick={() => commit(t)}><I size={17} /> {t}</button>)}
        </div>
      </Hud>
      <StatusBadge status="online" label="Voice service ready" />
    </>
  );
}
