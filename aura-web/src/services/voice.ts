/**
 * VoiceService abstraction. Vapi / ElevenLabs providers are implemented server-side
 * (keys never ship to the browser); the browser provider below uses the Web Speech API
 * as a local fallback when available.
 */
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

export const browserVoice: VoiceService = {
  supported: !!Ctor,
  listen(onText, onEnd) {
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
