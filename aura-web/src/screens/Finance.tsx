import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, ShieldCheck, CalendarDays, BarChart3, Receipt, Eye, EyeOff, TrendingUp, TrendingDown, HandCoins, ShoppingBag, PiggyBank, Lightbulb, Leaf,
  Sparkles, PlusCircle, Download, Target, ChevronLeft, ChevronRight, ArrowRight,
} from 'lucide-react';
import { Hud, IconBox, PageHero, NeonButton, BarChart, Donut, FilterDropdown, FuturisticModal, HudInput, DemoFlag, toast, type Tone } from '../components/aura';
import { AICommandPanel, confirmActions, type AIReply } from '../components/ai';
import { TransactionRow, BudgetCard, GoalCard, inr } from '../components/finance';
import { expenseBreakdown, type Budget } from '../data/mockBudgets';
import { monthlyExpenses, type TxCategory } from '../data/mockTransactions';
import type { Goal } from '../data/mockGoals';
import { transactionsStore, budgetsStore, goalsStore } from '../state/stores';
import { uid } from '../state/store';
import { usePageSearch, matches } from '../state/search';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TX_CATS: TxCategory[] = ['Food & Dining', 'Shopping', 'Travel', 'Bills & Utilities', 'Subscriptions', 'Others'];
const RANGES = ['This Month', 'Last Month', 'This Year'] as const;

type Dialog = { kind: 'expense' | 'income' } | { kind: 'budget'; b?: Budget } | { kind: 'goal'; g: Goal } | null;

export default function Finance() {
  const nav = useNavigate();
  const q = usePageSearch();
  const txs = transactionsStore.use();
  const budgets = budgetsStore.use();
  const goals = goalsStore.use();
  const [hide, setHide] = useState(false);
  const [month, setMonth] = useState(9);
  const [range, setRange] = useState<(typeof RANGES)[number]>('This Month');
  const [showAll, setShowAll] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState({ merchant: '', amount: '', category: 'Food & Dining' as TxCategory });

  const extra = useMemo(() => txs.filter((t) => t.id.startsWith('tx_')), [txs]);
  const addedExpense = extra.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const addedIncome = extra.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const balance = 248500 + addedIncome - addedExpense;
  const expenses = 42300 + addedExpense;
  const income = 75000 + addedIncome;
  const series = monthlyExpenses.map((v, i) => (i === 9 ? v + addedExpense : v));
  const window6 = series.slice(Math.max(0, month - 10), month + 1);
  const labels = MONTHS.slice(Math.max(0, month - 10), month + 1);
  const breakdown = range === 'This Month' ? expenseBreakdown : expenseBreakdown.map((s, i) => ({ ...s, value: [24, 22, 18, 13, 9, 14][i] }));
  const center = range === 'This Year' ? inr(series.reduce((a, b) => a + b, 0)) : range === 'Last Month' ? inr(series[8]) : inr(expenses);
  const shownTx = txs.filter((t) => matches(q, t.merchant, t.category));
  const money = (s: string) => (hide ? '••••••' : s);

  const saveTx = (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.merchant.trim() || !(amt > 0)) { toast('Enter a name and an amount above zero.'); return; }
    const isExp = dialog?.kind === 'expense';
    transactionsStore.set((ts) => [{ id: uid('tx'), merchant: form.merchant, logo: isExp ? form.merchant : 'Salary', when: 'Just now', category: isExp ? form.category : 'Income', amount: isExp ? -amt : amt }, ...ts]);
    if (isExp) budgetsStore.set((bs) => bs.map((b) => (b.category === form.category ? { ...b, spent: b.spent + amt } : b)));
    toast(`${isExp ? 'Expense' : 'Income'} of ${inr(amt)} recorded (demo ledger).`);
    setDialog(null);
    setForm({ merchant: '', amount: '', category: 'Food & Dining' });
  };

  const ai = (p: string): AIReply => {
    const t = p.toLowerCase();
    const food = budgets.find((b) => b.category === 'Food & Dining')!;
    if (/food|28%/.test(t)) return { text: `You've spent ${inr(food.spent)} of your ${inr(food.limit)} food budget — 28% more than last month, mostly on delivery. I suggest a limit of ₹8,000 next month.`,
      preview: ['Food & Dining budget: ₹10,000 → ₹8,000'],
      actions: confirmActions('Set ₹8,000 limit', () => { budgetsStore.set((bs) => bs.map((b) => (b.id === food.id ? { ...b, limit: 8000 } : b))); return 'Food & Dining budget set to ₹8,000.'; }) };
    if (/subscri|save/.test(t)) return { text: 'Three subscriptions look unused in the last 60 days (demo analysis). Cancelling them would save about ₹5,000/month. I can prepare cancellation reminders — I never cancel on your behalf.',
      preview: ['Remind: review Netflix Premium (₹649)', 'Remind: review Cloud storage 2TB (₹650)', 'Remind: review Gym app (₹3,700/yr)'],
      actions: confirmActions('Create reminders', () => '3 subscription review reminders created.') };
    if (/savings|great job/.test(t)) return { text: `Your savings rose 18% this month to ${inr(32700)}. At this rate, your Europe Trip goal completes in about 6 months.` };
    return { text: `This month: income ${inr(income)}, expenses ${inr(expenses)}, savings ${inr(income - expenses)}. Informational only — not regulated financial advice.` };
  };

  return (
    <div className="module">
      <div className="main">
        <PageHero title={<>Finance <span className="grad">Smarter</span><br />with <span className="grad">AURA</span></>} lead="Track, plan, invest, and grow your money with AI." image="/aura/hero-finance.jpg" imageWidth="26%" quote="Your Money. Your Goals. A Smarter Future."
          feats={[
            { icon: Wallet, title: 'Track expenses', sub: 'Automatically', tone: 'violet' },
            { icon: ShieldCheck, title: 'Smart insights', sub: 'AI-powered analysis' },
            { icon: CalendarDays, title: 'Budget planning', sub: 'Stay on track', tone: 'teal' },
            { icon: BarChart3, title: 'Investment guidance', sub: 'Build wealth', tone: 'violet' },
            { icon: Receipt, title: 'Bill reminders', sub: 'Never miss a payment', tone: 'violet' },
          ]} />

        <div className="grid g4">
          {([
            [Wallet, 'Total Balance', balance, '12% from last month', true, 'blue'],
            [HandCoins, 'Monthly Income', income, '5% from last month', true, 'green'],
            [ShoppingBag, 'Monthly Expenses', expenses, '8% from last month', false, 'pink'],
            [PiggyBank, 'Savings', income - expenses, '18% from last month', true, 'violet'],
          ] as const).map(([I, l, v, d, up, tone]) => (
            <div className="hud row" key={l} style={{ alignItems: 'flex-start', gap: 14 }}>
              <IconBox icon={I} tone={tone as Tone} size="lg" />
              <div>
                <div className="row t-sub" style={{ gap: 6 }}>{l}
                  {l === 'Total Balance' && <button onClick={() => setHide((h) => !h)} className="icon-btn bare" style={{ width: 24, height: 24, color: 'var(--aura-cyan)' }} aria-pressed={hide} aria-label={hide ? 'Show amounts' : 'Hide amounts'}>{hide ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
                </div>
                <b style={{ fontSize: 24, fontFamily: 'var(--font-head)' }}>{money(inr(v))}</b>
                <div className={`row ${up ? 'c-green' : 'c-red'}`} style={{ fontSize: 12.5, gap: 4 }}>{up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid g2">
          <Hud corners>
            <div className="row between" style={{ marginBottom: 10 }}>
              <h2 className="section-title">Expense Overview</h2>
              <div className="row" style={{ gap: 6 }}>
                <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setMonth((m) => Math.max(5, m - 1))} aria-label="Previous month"><ChevronLeft size={15} /></button>
                <span className="chip" aria-live="polite">{new Date(2025, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setMonth((m) => Math.min(11, m + 1))} aria-label="Next month"><ChevronRight size={15} /></button>
              </div>
            </div>
            <BarChart values={window6} labels={labels} height={210} />
            <div className="t-sub" style={{ marginTop: 6 }}>{MONTHS[month]} spend: <b style={{ color: '#fff' }}>{money(inr(series[month]))}</b></div>
          </Hud>
          <Hud corners>
            <div className="row between" style={{ marginBottom: 10 }}>
              <h2 className="section-title">Expense Breakdown</h2>
              <FilterDropdown value={range} options={RANGES} onChange={setRange} align="right" />
            </div>
            <div className="row wrap" style={{ gap: 20 }}>
              <Donut data={breakdown} size={170} stroke={24} center={money(center)} sub="Total" />
              <div className="legend" style={{ flex: 1, minWidth: 160 }}>
                {breakdown.map((s) => <div key={s.label} className="legend-row"><span className="sw" style={{ background: s.color, borderRadius: '50%' }} /><span>{s.label}</span><span className="v">{s.value}%</span></div>)}
              </div>
            </div>
          </Hud>
        </div>

        <div className="grid g2">
          <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Recent Transactions</span>} action={showAll ? 'Show less' : 'View All'} onAction={() => setShowAll((s) => !s)}>
            <div className="list">{(showAll ? shownTx : shownTx.slice(0, 4)).map((t) => <TransactionRow key={t.id} tx={t} hide={hide} />)}</div>
            {!shownTx.length && <div className="empty">No transactions match “{q}”.</div>}
          </Hud>
          <Hud corners title={<span className="section-title" style={{ fontSize: 20 }}>Budgets</span>} action="Add Budget" onAction={() => setDialog({ kind: 'budget' })}>
            <div className="list">{budgets.map((b) => <BudgetCard key={b.id} b={b} hide={hide} onEdit={() => setDialog({ kind: 'budget', b })} />)}</div>
          </Hud>
        </div>
        <DemoFlag label="DEMO DATA — connect a bank / SMS parser to see real transactions" />
      </div>

      <div className="rail">
        <AICommandPanel title="AI Finance Insights"
          header={
            <div className="list" style={{ marginBottom: 10 }}>
              {[[Lightbulb, 'amber', 'You spent 28% more on food this month. Consider setting a budget limit of ₹8,000.'], [TrendingUp, 'green', 'You can save ₹5,000/month by reducing unnecessary subscriptions.'], [Leaf, 'teal', 'Great job! Your savings increased by 18% this month.']].map(([I, t, s]) => (
                <div key={s as string} className="li" style={{ alignItems: 'flex-start' }}><IconBox icon={I as typeof Leaf} tone={t as Tone} size="sm" /><span style={{ fontSize: 13.5 }}>{s as string}</span></div>
              ))}
            </div>
          }
          prompts={['Help me cut food spending', 'How can I save ₹5,000/month?', 'Summarize this month']} promptStyle="boxes"
          onAsk={ai} cta="Ask AURA about my finances" ctaIcon={Sparkles} placeholder="Ask about your money…"
          footer={<p className="t-mute" style={{ marginTop: 8 }}>Informational only — not regulated financial advice. AURA never moves money.</p>} />

        <Hud corners title="Financial Goals" action="Add money" onAction={() => setDialog({ kind: 'goal', g: goals[0] })}>
          <div className="stack" style={{ gap: 16 }}>{goals.map((g) => <GoalCard key={g.id} g={g} hide={hide} onContribute={() => setDialog({ kind: 'goal', g })} />)}</div>
        </Hud>

        <Hud corners title="Quick Actions">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
            {([[PlusCircle, 'Add Expense', 'blue', () => setDialog({ kind: 'expense' })], [Download, 'Add Income', 'green', () => setDialog({ kind: 'income' })], [Target, 'Set Budget', 'pink', () => setDialog({ kind: 'budget' })], [BarChart3, 'View Reports', 'violet', () => nav('/analytics')]] as const).map(([I, l, tone, fn]) => (
              <button key={l} className="stack" style={{ background: 'none', border: 0, alignItems: 'center', gap: 6 }} onClick={fn}><IconBox icon={I} tone={tone as Tone} size="lg" /><span style={{ fontSize: 11.5 }}>{l}</span></button>
            ))}
          </div>
        </Hud>
      </div>

      {(dialog?.kind === 'expense' || dialog?.kind === 'income') && (
        <FuturisticModal title={dialog.kind === 'expense' ? 'Add Expense' : 'Add Income'} icon={dialog.kind === 'expense' ? PlusCircle : Download} onClose={() => setDialog(null)}>
          <form className="stack" style={{ gap: 12 }} onSubmit={saveTx}>
            <HudInput label={dialog.kind === 'expense' ? 'Merchant' : 'Source'} value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder={dialog.kind === 'expense' ? 'e.g. Swiggy' : 'e.g. Freelance project'} autoFocus />
            <HudInput label="Amount (₹)" type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            {dialog.kind === 'expense' && (
              <div className="field"><label htmlFor="tx-cat">Category</label>
                <select id="tx-cat" className="select" style={{ height: 44 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TxCategory })}>{TX_CATS.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
            )}
            <div className="row" style={{ justifyContent: 'flex-end' }}><NeonButton type="button" onClick={() => setDialog(null)}>Cancel</NeonButton><NeonButton type="submit" variant="primary">Save</NeonButton></div>
          </form>
        </FuturisticModal>
      )}

      {dialog?.kind === 'budget' && <BudgetDialog b={dialog.b} existing={budgets} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'goal' && <GoalDialog g={dialog.g} goals={goals} onClose={() => setDialog(null)} />}
    </div>
  );
}

function BudgetDialog({ b, existing, onClose }: { b?: Budget; existing: Budget[]; onClose: () => void }) {
  const [cat, setCat] = useState<TxCategory>(b?.category ?? 'Food & Dining');
  const cur = existing.find((x) => x.category === cat);
  const [limit, setLimit] = useState(String(b?.limit ?? cur?.limit ?? 5000));
  const save = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(limit);
    if (!(n > 0)) return toast('Enter a limit above zero.');
    budgetsStore.set((bs) => (bs.some((x) => x.category === cat) ? bs.map((x) => (x.category === cat ? { ...x, limit: n } : x)) : [...bs, { id: uid('bg'), category: cat, icon: Target, tone: 'violet', spent: 0, limit: n }]));
    toast(`${cat} budget set to ${inr(n)}.`);
    onClose();
  };
  return (
    <FuturisticModal title={b ? `Edit ${b.category} budget` : 'Set Budget'} icon={Target} onClose={onClose}>
      <form className="stack" style={{ gap: 12 }} onSubmit={save}>
        {!b && <div className="field"><label htmlFor="bg-cat">Category</label><select id="bg-cat" className="select" style={{ height: 44 }} value={cat} onChange={(e) => setCat(e.target.value as TxCategory)}>{TX_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>}
        {cur && <div className="t-sub">Spent so far: {inr(cur.spent)}</div>}
        <HudInput label="Monthly limit (₹)" type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} autoFocus />
        <div className="row" style={{ justifyContent: 'flex-end' }}><NeonButton type="button" onClick={onClose}>Cancel</NeonButton><NeonButton type="submit" variant="primary">Save budget</NeonButton></div>
      </form>
    </FuturisticModal>
  );
}

function GoalDialog({ g, goals, onClose }: { g: Goal; goals: Goal[]; onClose: () => void }) {
  const [id, setId] = useState(g.id);
  const [amt, setAmt] = useState('5000');
  const goal = goals.find((x) => x.id === id)!;
  const save = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amt);
    if (!(n > 0)) return toast('Enter an amount above zero.');
    goalsStore.set((gs) => gs.map((x) => (x.id === id ? { ...x, saved: Math.min(x.target, x.saved + n) } : x)));
    toast(`${inr(n)} added to ${goal.name} (demo — no money moved).`);
    onClose();
  };
  return (
    <FuturisticModal title="Add to Goal" icon={ArrowRight} onClose={onClose}>
      <form className="stack" style={{ gap: 12 }} onSubmit={save}>
        <div className="field"><label htmlFor="gl">Goal</label><select id="gl" className="select" style={{ height: 44 }} value={id} onChange={(e) => setId(e.target.value)}>{goals.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        <div className="t-sub">{inr(goal.saved)} of {inr(goal.target)} saved</div>
        <HudInput label="Amount (₹)" type="number" min={1} value={amt} onChange={(e) => setAmt(e.target.value)} autoFocus />
        <div className="row" style={{ justifyContent: 'flex-end' }}><NeonButton type="button" onClick={onClose}>Cancel</NeonButton><NeonButton type="submit" variant="primary">Add</NeonButton></div>
      </form>
    </FuturisticModal>
  );
}
