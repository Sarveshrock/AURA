/**
 * VoiceService abstraction. Vapi / ElevenLabs providers are implemented server-side
 * (keys never ship to the browser); the browser provider below uses the Web Speech API
 * as a local fallback when available.
 */
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { apiBlob } from './api';
import { speakNow, stopSpeakingNow } from './speech';

export interface VoiceService {
  readonly supported: boolean;
  listen(onText: (text: string, final: boolean) => void, onEnd: () => void): () => void;
  speak(text: string): void;
}

type SR = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
  start(): void; stop(): void;
};

const Ctor: (new () => SR) | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition)
    : undefined;

const isNative = Capacitor.isNativePlatform();

/** Android's WebView has no Web Speech API, so on-device recognition goes through the native plugin instead. */
function listenNative(onText: (text: string, final: boolean) => void, onEnd: () => void): () => void {
  let last = '';
  let ended = false;
  const handles: Promise<{ remove: () => Promise<void> }>[] = [];
  const finish = () => {
    if (ended) return;
    ended = true;
    if (last) onText(last, true);
    handles.forEach((h) => void h.then((x) => x.remove()));
    onEnd();
  };
  handles.push(SpeechRecognition.addListener('partialResults', (d) => { last = d.matches?.[0] ?? last; if (last) onText(last, false); }));
  handles.push(SpeechRecognition.addListener('listeningState', (d) => { if (d.status === 'stopped') finish(); }));
  void (async () => {
    try {
      const perm = await SpeechRecognition.requestPermissions();
      if (perm.speechRecognition !== 'granted') return finish();
      await SpeechRecognition.start({ language: 'en-IN', partialResults: true, popup: false, maxResults: 1 });
    } catch { finish(); }
  })();
  return () => { void SpeechRecognition.stop().catch(() => undefined); };
}

export const browserVoice: VoiceService = {
  supported: isNative || !!Ctor,
  listen(onText, onEnd) {
    if (isNative) return listenNative(onText, onEnd);
    if (!Ctor) { onEnd(); return () => {}; }
    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const res = e.results[e.results.length - 1];
      onText(res[0].transcript, res.isFinal);
    };
    rec.onend = onEnd;
    rec.onerror = onEnd;
    rec.start();
    return () => rec.stop();
  },
  speak(text) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  },
};

/**
 * Server-side text-to-speech (Gemini via the backend /voice/speak route; keys never reach the browser).
 * Falls back to the browser voice if the backend is unavailable. Resolves when playback ends.
 */
let currentAudio: HTMLAudioElement | null = null;
export const serverVoice = {
  stop() {
    stopSpeakingNow();
    currentAudio?.pause();
    currentAudio = null;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  },
  async speak(text: string): Promise<void> {
    this.stop();
    const trimmed = text.slice(0, 1800);
    // On the phone, speak with its own voice: it starts instantly instead of waiting for the server to generate audio.
    if (Capacitor.isNativePlatform()) { await speakNow(trimmed); return; }
    try {
      const blob = await apiBlob('/voice/speak', { text: trimmed });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed'));
        void audio.play().catch(reject);
      });
      URL.revokeObjectURL(url);
    } catch {
      browserVoice.speak(trimmed);
    }
  },
};
