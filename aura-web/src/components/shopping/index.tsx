import { Heart, ShoppingCart, Star, Minus, Plus, Trash2 } from 'lucide-react';
import { NeonButton } from '../aura';
import type { Product } from '../../data/mockProducts';

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={11} fill={i <= Math.round(value) ? 'currentColor' : 'none'} />)}
    </span>
  );
}

export function ProductCard({ p, liked, inCart, onLike, onAdd }: { p: Product; liked: boolean; inCart: number; onLike: () => void; onAdd: () => void }) {
  return (
    <article className="tile stack" style={{ gap: 7, padding: 10 }}>
      <div className="media" style={{ height: 118 }}>
        <img src={p.image} alt={p.name} loading="lazy" />
        {p.badge && <span className="media-badge" style={{ background: p.badge === 'Best Deal' ? '#ff4f8b' : '#9b5cff' }}>{p.badge}</span>}
        <button className={`fav-btn ${liked ? 'on' : ''}`} onClick={onLike} aria-pressed={liked} aria-label={liked ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}>
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h4 className="t-title" style={{ fontSize: 14.5, minHeight: 38, margin: 0 }}>{p.name}</h4>
      <div className="row t-sub" style={{ fontSize: 11.5, gap: 5 }}><Stars value={p.rating} /> {p.rating} ({p.reviews})</div>
      <div className="row" style={{ gap: 8 }}><b style={{ fontSize: 19 }}>{inr(p.price)}</b>{p.mrp && <s className="t-mute">{inr(p.mrp)}</s>}</div>
      <NeonButton size="sm" variant="primary" block icon={ShoppingCart} onClick={onAdd}>{inCart ? `In Cart (${inCart})` : 'Add to Cart'}</NeonButton>
    </article>
  );
}

export function CartLine({ p, qty, onDec, onInc, onRemove }: { p: Product; qty: number; onDec: () => void; onInc: () => void; onRemove: () => void }) {
  return (
    <div className="li">
      <span className="media" style={{ width: 46, height: 46, flexShrink: 0 }}><img src={p.image} alt="" /></span>
      <div className="grow"><div className="t-title ellipsis" style={{ fontSize: 13 }}>{p.name}</div><div className="t-sub">{inr(p.price)}</div></div>
      <div className="row" style={{ gap: 6 }}>
        <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={onDec} aria-label={`Decrease ${p.name}`}><Minus size={12} /></button>
        <span className="mono" aria-live="polite" style={{ minWidth: 14, textAlign: 'center' }}>{qty}</span>
        <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={onInc} aria-label={`Increase ${p.name}`}><Plus size={12} /></button>
        <button className="icon-btn bare" style={{ width: 24, height: 24 }} onClick={onRemove} aria-label={`Remove ${p.name}`}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}
