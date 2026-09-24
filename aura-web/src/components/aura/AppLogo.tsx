/** Brand-coloured app marks for integrations (data-driven; no external logo assets). */
const apps: Record<string, { bg: string; fg?: string; glyph: string; font?: string }> = {
  Gmail: { bg: '#fff', fg: '#ea4335', glyph: 'M' },
  'Google Calendar': { bg: '#fff', fg: '#1a73e8', glyph: '31' },
  'Google Drive': { bg: '#fff', fg: '#0f9d58', glyph: '▲' },
  'Google Maps': { bg: '#fff', fg: '#34a853', glyph: '⌖' },
  'Google Flights': { bg: '#1a73e8', glyph: '✈' },
  MakeMyTrip: { bg: '#e8232c', glyph: 'my', font: 'italic 800 18px Inter' },
  Swiggy: { bg: '#fc8019', glyph: 'S' },
  Zomato: { bg: '#e23744', glyph: 'zomato', font: '800 10px Inter' },
  'Zomato / Swiggy': { bg: '#e23744', glyph: 'Z' },
  Uber: { bg: '#000', glyph: 'Uber', font: '600 13px Inter' },
  Ola: { bg: '#111', fg: '#d8f022', glyph: '●' },
  IRCTC: { bg: '#fff', fg: '#1d3f91', glyph: 'IR', font: '800 14px Inter' },
  Flipkart: { bg: '#f8d51a', fg: '#1f5fd6', glyph: 'f', font: 'italic 800 24px Inter' },
  Amazon: { bg: '#fff', fg: '#111', glyph: 'a', font: '800 24px Inter' },
  'Phone (Permissions)': { bg: '#1a73e8', glyph: '✆' },
  Weather: { bg: '#2563eb', fg: '#ffd166', glyph: '☀' },
  Slack: { bg: '#fff', fg: '#e01e5a', glyph: '#', font: '800 22px Inter' },
  Notion: { bg: '#fff', fg: '#111', glyph: 'N', font: '800 20px Georgia' },
  Spotify: { bg: '#1db954', fg: '#000', glyph: '≋' },
  LinkedIn: { bg: '#0a66c2', glyph: 'in', font: '800 18px Inter' },
  WhatsApp: { bg: '#25d366', glyph: '✆' },
  YouTube: { bg: '#ff0000', glyph: '▶' },
  'Google Meet': { bg: '#fff', fg: '#00897b', glyph: '▶' },
  Airbnb: { bg: '#ff385c', glyph: 'A' },
  ChatGPT: { bg: '#10a37f', glyph: '✺', font: '800 22px Inter' },
  GitHub: { bg: '#fff', fg: '#111', glyph: '⌥', font: '800 20px Inter' },
  Shopping: { bg: '#8b5cff', glyph: 'S', font: '800 20px Inter' },
  Netflix: { bg: '#000', fg: '#e50914', glyph: 'N', font: '800 22px Inter' },
  Salary: { bg: '#0f5132', fg: '#6ee7b7', glyph: '₹', font: '800 20px Inter' },
  Bill: { bg: '#3b2f0b', fg: '#ffc857', glyph: 'kW', font: '800 14px Inter' },
  Nykaa: { bg: '#fc2779', glyph: 'N', font: '800 20px Inter' },
  BigBasket: { bg: '#84c225', glyph: 'bb', font: '800 16px Inter' },
  Nike: { bg: '#fff', fg: '#111', glyph: '✓', font: '800 22px Inter' },
};

export default function AppLogo({ name, size = 44 }: { name: string; size?: number }) {
  const a = apps[name] ?? { bg: '#0d2033', fg: '#19e6ff', glyph: name.slice(0, 2) };
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: size * 0.22,
        background: a.bg, color: a.fg ?? '#fff', font: a.font ?? `800 ${Math.round(size * 0.42)}px Inter`, letterSpacing: -0.5,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 4px 14px rgba(0,0,0,0.4)',
      }}
    >
      {a.glyph}
    </span>
  );
}
