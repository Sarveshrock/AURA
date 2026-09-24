import { Heart, ArrowRight } from 'lucide-react';
import { NeonButton } from '../aura';
import type { Destination, TravelDeal } from '../../data/mockTrips';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function DestinationCard({ d, liked, onLike, onPick }: { d: Destination; liked: boolean; onLike: () => void; onPick: () => void }) {
  return (
    <article className="tile" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="media" style={{ height: 108, borderRadius: 0 }}>
        <img src={d.image} alt={d.name} loading="lazy" />
        <button className={`fav-btn dark ${liked ? 'on' : ''}`} onClick={onLike} aria-pressed={liked} aria-label={`Save ${d.name}`}><Heart size={16} fill={liked ? 'currentColor' : 'none'} /></button>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <b style={{ fontSize: 16 }}>{d.name}</b>
        <div className="t-sub" style={{ fontSize: 12.5 }}>{d.tags}</div>
        <div className="row between" style={{ marginTop: 8 }}>
          <span style={{ fontSize: 13 }}>From <b style={{ fontSize: 16 }}>{inr(d.from)}</b></span>
          <button className="icon-btn" style={{ width: 30, height: 30, color: 'var(--aura-cyan)' }} onClick={onPick} aria-label={`Plan trip to ${d.name}`}><ArrowRight size={15} /></button>
        </div>
      </div>
    </article>
  );
}

export function DealCard({ deal, onBook }: { deal: TravelDeal; onBook: () => void }) {
  return (
    <article className="tile row" style={{ padding: 0, overflow: 'hidden', gap: 0, alignItems: 'stretch' }}>
      <div className="media" style={{ width: '48%', borderRadius: 0, minHeight: 92 }}><img src={deal.image} alt={deal.name} loading="lazy" /></div>
      <div className="stack" style={{ gap: 4, padding: '10px 12px', flex: 1, justifyContent: 'center' }}>
        <b style={{ fontSize: 14 }}>{deal.name}</b>
        <span className="c-amber" style={{ fontSize: 13 }}>{deal.offer}</span>
        <NeonButton size="sm" onClick={onBook}>Book Now</NeonButton>
      </div>
    </article>
  );
}
