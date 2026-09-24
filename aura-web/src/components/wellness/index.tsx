import { IconBox, toneHex } from '../ui';
import type { Meal, Metric, PlanItem } from '../../data/mockWellnessData';

/** Timeline row in "Today's Wellness Plan" */
export function PlanRow({ item, last, onToggle }: { item: PlanItem; last: boolean; onToggle: () => void }) {
  return (
    <div className="row" style={{ alignItems: 'stretch', gap: 12 }}>
      <div style={{ width: 62, paddingTop: 10, fontSize: 13.5, flexShrink: 0 }}>
        {item.time}
        {item.progress !== undefined && <div className="c-green" style={{ fontSize: 12 }}>{item.progress}%</div>}
      </div>
      <div className="stack" style={{ gap: 0, alignItems: 'center', width: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 14, background: item.done ? 'var(--aura-green)' : 'var(--aura-primary)', boxShadow: `0 0 8px ${item.done ? 'var(--aura-green)' : 'var(--aura-primary)'}` }} />
        {!last && <span style={{ flex: 1, width: 1.5, background: 'var(--aura-border-mid)' }} />}
      </div>
      <div className="li grow" style={{ padding: '6px 0 12px' }}>
        <IconBox icon={item.icon} tone={item.tone} />
        <div className="grow"><div className="t-title">{item.title}</div><div className="t-sub">{item.sub}</div></div>
        <input type="checkbox" className="check" style={{ width: 24, height: 24, borderRadius: '50%' }} checked={item.done} onChange={onToggle} aria-label={`Mark ${item.title} done`} />
      </div>
    </div>
  );
}

export function MetricRow({ m }: { m: Metric }) {
  const c = toneHex[m.tone];
  return (
    <div className="li">
      <IconBox icon={m.icon} tone={m.tone} size="sm" />
      <div className="grow"><div style={{ fontSize: 14 }}>{m.name}</div><div className="t-sub">{m.value}</div></div>
      <span className="tag" style={{ color: m.status.startsWith('-') ? c : 'var(--aura-green)', borderColor: 'transparent', background: 'rgba(0,229,168,0.1)' }}>{m.status}</span>
    </div>
  );
}

export function MealRow({ meal, onToggle }: { meal: Meal; onToggle: () => void }) {
  return (
    <div className="li">
      <span className="media" style={{ width: 70, height: 66, flexShrink: 0 }}><img src={meal.image} alt={meal.dish} loading="lazy" /></span>
      <div className="grow"><div className="t-title" style={{ fontSize: 15 }}>{meal.name}</div><div className="t-sub" style={{ fontSize: 13.5 }}>{meal.dish}</div><div className="t-sub">{meal.kcal} kcal</div></div>
      <input type="checkbox" className="check" style={{ width: 24, height: 24, borderRadius: '50%' }} checked={meal.eaten} onChange={onToggle} aria-label={`Ate ${meal.name}`} />
    </div>
  );
}
