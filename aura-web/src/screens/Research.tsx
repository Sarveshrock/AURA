import { useMemo, useState, type FormEvent } from 'react';
import {
  Search, FileText, Lightbulb, BarChart3, PenLine, Folder, Upload, StickyNote, ListTree, Download, Quote, CalendarDays, MessagesSquare, Mic,
  ArrowRight, Plus, Trash2, Pencil, BookOpen, TrendingUp, BookMarked,
} from 'lucide-react';
import { Hud, IconBox, PageHero, NeonButton, NeonTabs, FilterDropdown, MoreMenu, FuturisticModal, HudInput, DemoFlag, toast, type Tone } from '../components/aura';
import { AICommandPanel, confirmActions, type AIReply } from '../components/ai';
import { ResearchPaperCard, citation } from '../components/research';
import { mockPapers, mockProjects, type Paper, type ResearchProject } from '../data/mockResearchPapers';
import { savedPapersStore } from '../state/stores';
import { uid } from '../state/store';
import { usePageSearch, matches } from '../state/search';

const TABS = ['Literature Search', 'My Research', 'Paper Summarizer', 'Idea Generator', 'Citation & Writing', 'Data Analysis'] as const;
type Tab = (typeof TABS)[number];
const tabIcons = { 'Literature Search': Search, 'My Research': Folder, 'Paper Summarizer': FileText, 'Idea Generator': Lightbulb, 'Citation & Writing': Quote, 'Data Analysis': BarChart3 };
const SOURCES = ['All Sources', 'arXiv', 'IEEE', 'Nature', 'ACM'] as const;
const FIELDS = ['Computer Science', 'Earth Science', 'All Fields'] as const;
const YEARS = ['Last 5 Years', 'Last 2 Years', 'Any time'] as const;
const ACCESS = ['Open Access', 'All Access'] as const;
const TOPICS = ['GenAI', 'Machine Learning', 'Cyber Security', 'Data Engineering', 'Healthcare AI', 'Climate Change', 'Robotics'];

export default function Research() {
  const hq = usePageSearch();
  const saved = savedPapersStore.use();
  const [tab, setTab] = useState<Tab>('Literature Search');
  const [query, setQuery] = useState('');
  const [applied, setApplied] = useState('');
  const [source, setSource] = useState<(typeof SOURCES)[number]>('All Sources');
  const [field, setField] = useState<(typeof FIELDS)[number]>('Computer Science');
  const [years, setYears] = useState<(typeof YEARS)[number]>('Last 5 Years');
  const [access, setAccess] = useState<(typeof ACCESS)[number]>('All Access');
  const [summaries, setSummaries] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [moreTopics, setMoreTopics] = useState(false);
  const [projects, setProjects] = useState<ResearchProject[]>(mockProjects);
  const [summary, setSummary] = useState<Paper | null>(null);
  const [projDialog, setProjDialog] = useState<ResearchProject | 'new' | null>(null);
  const [projName, setProjName] = useState('');
  const [trigger, setTrigger] = useState<{ prompt: string; id: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const minYear = years === 'Last 5 Years' ? 2021 : years === 'Last 2 Years' ? 2024 : 0;
  const papers = useMemo(() => mockPapers.filter((p) =>
    (source === 'All Sources' || p.source === source) && (field === 'All Fields' || p.field === field) && p.year >= minYear && (access === 'All Access' || p.openAccess)
    && (!topics.length || topics.some((t) => p.tags.includes(t) || (t === 'Machine Learning' && p.tags.includes('LLM'))))
    && matches(applied.toLowerCase(), p.title, p.summary, ...p.tags) && matches(hq, p.title, p.summary, ...p.tags)
    && (tab !== 'My Research' || saved.includes(p.id))), [source, field, minYear, access, topics, applied, hq, tab, saved]);

  const runSearch = (e?: FormEvent) => { e?.preventDefault(); setSearching(true); setTimeout(() => { setApplied(query); setSearching(false); }, 500); };
  const toggleSave = (p: Paper) => { savedPapersStore.set((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id])); toast(saved.includes(p.id) ? 'Removed from saved papers.' : `Saved “${p.title.slice(0, 40)}…”`); };
  const cite = (p: Paper) => { navigator.clipboard?.writeText(citation(p)).catch(() => undefined); toast('Citation copied to clipboard.'); };
  const toProject = (p: Paper) => { setProjects((ps) => ps.map((x, i) => (i === 0 ? { ...x, papers: x.papers + 1, updated: 'Updated just now' } : x))); toast(`Added to “${projects[0]?.name}”.`); void p; };

  const ai = (p: string): AIReply => {
    const t = p.toLowerCase();
    if (/rag/.test(t)) { setQuery('RAG'); setApplied('RAG'); setTab('Literature Search'); return { text: 'Filtered your library to RAG papers. The most relevant is “RAG in Production: Best Practices and Challenges” (IEEE, 2024).' }; }
    if (/summari/.test(t)) {
      const paper = papers[0] ?? mockPapers[0];
      return { text: `Summary of “${paper.title}” (${paper.source}, ${paper.year}): ${paper.summary}`, preview: paper.keyPoints.map((k) => `• ${k}`), actions: confirmActions('Save summary to project', () => { toProject(paper); return 'Summary saved to your project.'; }) };
    }
    if (/explain|simply/.test(t)) return { text: 'Agentic AI, simply: instead of answering one question, an AI plans steps, uses tools (search, calendar, code), checks its work, and asks you before doing anything important. Think “assistant that can do”, not just “assistant that can talk”.' };
    if (/proposal/.test(t)) return { text: 'Here is a proposal outline you can start from:', preview: ['1. Problem & motivation', '2. Related work (use saved papers)', '3. Research questions', '4. Method & datasets', '5. Evaluation plan', '6. Timeline & risks'],
      actions: confirmActions('Create proposal project', () => { setProjects((ps) => [{ id: uid('rp'), name: 'Research Proposal', papers: saved.length, updated: 'Updated just now', tone: 'cyan' }, ...ps]); return '“Research Proposal” project created with the outline.'; }) };
    if (/idea/.test(t)) return { text: 'Three idea directions from your saved topics:', preview: ['Evaluating agent safety with approval gates', 'Cost-aware RAG for Indian-language corpora', 'Multimodal exam proctoring with privacy guarantees'] };
    return { text: 'I can find papers, summarize, explain concepts, draft outlines and format citations. Sources are always shown — please verify before citing.' };
  };

  const tools: [typeof FileText, string, Tone, string][] = [
    [FileText, 'PDF Summarizer', 'blue', 'Summarize this paper'], [Quote, 'Citation Generator', 'red', 'Format citations for my saved papers'], [CalendarDays, 'Research Planner', 'teal', 'Help me write a research proposal'],
    [MessagesSquare, 'Document Q&A', 'green', 'Explain this concept simply'], [BarChart3, 'Data Analysis', 'violet', 'Suggest a data analysis plan'], [Lightbulb, 'Idea Brainstormer', 'magenta', 'Generate research ideas'],
  ];

  return (
    <div className="module">
      <div className="main">
        <PageHero title={<>Research <span className="grad">Smarter</span><br />with <span className="grad">AURA</span></>} lead="Discover, analyze, and create research with the power of AI." image="/aura/hero-research.jpg" imageWidth="24%" quote="From curiosity to discovery, AURA is with you."
          feats={[
            { icon: Search, title: 'Find papers', sub: 'Across top databases' }, { icon: FileText, title: 'Summarize', sub: 'Get key insights instantly', tone: 'violet' },
            { icon: Lightbulb, title: 'Generate ideas', sub: 'For your next project', tone: 'amber' }, { icon: BarChart3, title: 'Analyze data', sub: 'With AI tools' }, { icon: PenLine, title: 'Write & cite', sub: 'In your style', tone: 'violet' },
          ]} />

        <NeonTabs tabs={TABS} value={tab} onChange={(t) => { setTab(t); if (t === 'Paper Summarizer') setTrigger({ prompt: 'Summarize this paper', id: Date.now() }); if (t === 'Idea Generator') setTrigger({ prompt: 'Generate research ideas', id: Date.now() }); if (t === 'Citation & Writing') setTrigger({ prompt: 'Help me write a research proposal', id: Date.now() }); }} icons={tabIcons} />

        <Hud corners>
          <h2 className="section-title" style={{ fontSize: 20, marginBottom: 12 }}>{tab === 'My Research' ? `My Saved Papers (${saved.length})` : 'Search Research Papers'}</h2>
          <form className="row" onSubmit={runSearch} role="search">
            <div className="input" style={{ flex: 1 }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search papers, topics, authors, or ask a research question..." aria-label="Search research papers" /></div>
            <NeonButton variant="ai" type="submit" disabled={searching}>{searching ? <span className="spinner" /> : <Search size={17} />} Search</NeonButton>
          </form>
          <div className="row wrap" style={{ margin: '12px 0' }}>
            <FilterDropdown value={source} options={SOURCES} onChange={setSource} />
            <FilterDropdown value={field} options={FIELDS} onChange={setField} />
            <FilterDropdown value={years} options={YEARS} onChange={setYears} />
            <FilterDropdown value={access} options={ACCESS} onChange={setAccess} />
            <label className="row t-sub" style={{ cursor: 'pointer' }}><input type="checkbox" className="check" checked={summaries} onChange={(e) => setSummaries(e.target.checked)} /> Include Summaries</label>
          </div>
          <div className="t-sub" style={{ marginBottom: 8 }}>Quick Topics</div>
          <div className="row wrap" style={{ gap: 8 }}>
            {(moreTopics ? [...TOPICS, 'Quantum', 'NLP'] : TOPICS).map((t) => <button key={t} className={`chip ${topics.includes(t) ? 'active' : ''}`} aria-pressed={topics.includes(t)} onClick={() => setTopics((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))}>{t}</button>)}
            <button className="chip" onClick={() => setMoreTopics((m) => !m)}>{moreTopics ? 'Less' : 'More'} <ArrowRight size={13} /></button>
            {(topics.length > 0 || applied) && <button className="chip" onClick={() => { setTopics([]); setApplied(''); setQuery(''); }}>Clear filters</button>}
          </div>
        </Hud>

        <Hud corners>
          <div className="row between" style={{ marginBottom: 12 }}>
            <h2 className="section-title" style={{ fontSize: 20 }}>{applied || topics.length ? `Results (${papers.length})` : 'Latest Papers for You'}</h2>
            <button className="c-blue row" style={{ background: 'none', border: 0 }} onClick={() => setTab(tab === 'My Research' ? 'Literature Search' : 'My Research')}>{tab === 'My Research' ? 'All papers' : 'Saved'} <ArrowRight size={14} /></button>
          </div>
          <div className="grid g3" style={{ gap: 12 }}>
            {papers.map((p) => <ResearchPaperCard key={p.id} p={p} saved={saved.includes(p.id)} showSummary={summaries} onSummary={() => setSummary(p)} onSave={() => toggleSave(p)} onCite={() => cite(p)} onAddToProject={() => toProject(p)} />)}
          </div>
          {!papers.length && <div className="empty">{tab === 'My Research' ? 'No saved papers yet — tap Save on any paper.' : 'No papers match these filters.'}</div>}
          <div style={{ marginTop: 10 }}><DemoFlag label="SAMPLE LIBRARY — verify sources before citing" /></div>
        </Hud>

        <div className="grid g2">
          <Hud corners title="Research Insights">
            <div className="grid g4" style={{ gap: 8 }}>
              {([[BookOpen, 243, 'Papers Read', '12%', 'blue'], [FileText, 18, 'Summaries Generated', '28%', 'blue'], [Folder, projects.length, 'Research Projects', '78%', 'magenta'], [BookMarked, 32 + saved.length, 'Citations Added', '41%', 'amber']] as const).map(([I, v, l, d, tone]) => (
                <div className="tile" key={l} style={{ padding: 10 }}><IconBox icon={I} tone={tone as Tone} size="sm" /><b style={{ fontSize: 18, display: 'block', marginTop: 6 }}>{v}</b><div className="t-sub" style={{ fontSize: 11.5 }}>{l}</div><div className="c-green row" style={{ fontSize: 11, gap: 3 }}><TrendingUp size={11} /> {d}</div></div>
              ))}
            </div>
          </Hud>
          <Hud corners title="Research Tools">
            <div className="grid g3" style={{ gap: 8 }}>
              {tools.map(([I, l, tone, prompt]) => <button key={l} className="tile stack" style={{ alignItems: 'center', gap: 6, textAlign: 'center', padding: 10 }} onClick={() => setTrigger({ prompt, id: Date.now() })}><IconBox icon={I} tone={tone} size="sm" /><span style={{ fontSize: 11.5 }}>{l}</span></button>)}
            </div>
          </Hud>
        </div>
      </div>

      <div className="rail">
        <AICommandPanel title="AI Research Assistant" header={<p className="t-sub" style={{ marginBottom: 10, fontSize: 14 }}>Ask me anything about research:</p>}
          prompts={['Summarize this paper', 'Find latest papers on RAG', 'Explain this concept simply', 'Help me write a research proposal']} promptStyle="boxes"
          onAsk={ai} cta="Talk to AURA" ctaIcon={Mic} placeholder="Ask a research question…" trigger={trigger} />
        <Hud corners title="My Research Projects" action="New" onAction={() => { setProjName(''); setProjDialog('new'); }}>
          <div className="list">
            {projects.map((p) => (
              <div className="li" key={p.id}>
                <IconBox icon={Folder} tone={p.tone} size="lg" />
                <div className="grow"><div className="t-title">{p.name}</div><div className="t-sub">{p.papers} papers • {p.updated}</div></div>
                <MoreMenu items={[
                  { label: 'Rename', icon: Pencil, onSelect: () => { setProjName(p.name); setProjDialog(p); } },
                  { label: 'Delete', icon: Trash2, danger: true, onSelect: () => { setProjects((ps) => ps.filter((x) => x.id !== p.id)); toast(`Deleted “${p.name}”.`); } },
                ]} />
              </div>
            ))}
          </div>
          <NeonButton variant="ai" block icon={Plus} style={{ marginTop: 10 }} onClick={() => { setProjName(''); setProjDialog('new'); }}>New Research Project</NeonButton>
        </Hud>
        <Hud corners title="Quick Actions">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
            {([
              [Upload, 'Upload PDF', () => document.getElementById('pdf-up')?.click()],
              [StickyNote, 'New Note', () => toast('Note created in Memory (demo).')],
              [ListTree, 'Create Outline', () => setTrigger({ prompt: 'Help me write a research proposal', id: Date.now() })],
              [Download, 'Export Citations', () => { const txt = mockPapers.filter((p) => saved.includes(p.id)).map(citation).join('\n'); navigator.clipboard?.writeText(txt).catch(() => undefined); toast(saved.length ? `${saved.length} citations copied.` : 'Save papers first to export citations.'); }],
            ] as const).map(([I, l, fn]) => <button key={l} className="stack" style={{ background: 'none', border: 0, alignItems: 'center', gap: 6, textAlign: 'center' }} onClick={fn}><IconBox icon={I} tone="blue" size="lg" /><span style={{ fontSize: 11.5 }}>{l}</span></button>)}
          </div>
          <input id="pdf-up" type="file" accept="application/pdf" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { toast(`“${f.name}” ready — ask AURA to summarize it (demo: file stays in your browser).`); setTrigger({ prompt: 'Summarize this paper', id: Date.now() }); } }} />
        </Hud>
      </div>

      {summary && (
        <FuturisticModal title="AI Summary" icon={FileText} onClose={() => setSummary(null)}>
          <b>{summary.title}</b>
          <div className="t-sub" style={{ margin: '4px 0 10px' }}>{summary.source} • {summary.year}</div>
          <p style={{ marginBottom: 10 }}>{summary.summary}</p>
          <ul className="t-sub" style={{ paddingLeft: 18, lineHeight: 1.8 }}>{summary.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
            <NeonButton icon={Quote} onClick={() => cite(summary)}>Copy citation</NeonButton>
            <NeonButton variant="primary" onClick={() => { toggleSave(summary); setSummary(null); }}>{saved.includes(summary.id) ? 'Unsave' : 'Save paper'}</NeonButton>
          </div>
        </FuturisticModal>
      )}
      {projDialog && (
        <FuturisticModal title={projDialog === 'new' ? 'New Research Project' : 'Rename Project'} icon={Folder} onClose={() => setProjDialog(null)}>
          <form className="stack" style={{ gap: 12 }} onSubmit={(e) => {
            e.preventDefault();
            if (!projName.trim()) return;
            if (projDialog === 'new') setProjects((ps) => [{ id: uid('rp'), name: projName, papers: 0, updated: 'Updated just now', tone: 'cyan' }, ...ps]);
            else setProjects((ps) => ps.map((x) => (x.id === projDialog.id ? { ...x, name: projName } : x)));
            toast(projDialog === 'new' ? `Project “${projName}” created.` : 'Project renamed.');
            setProjDialog(null);
          }}>
            <HudInput label="Project name" value={projName} onChange={(e) => setProjName(e.target.value)} autoFocus />
            <div className="row" style={{ justifyContent: 'flex-end' }}><NeonButton type="button" onClick={() => setProjDialog(null)}>Cancel</NeonButton><NeonButton type="submit" variant="primary">Save</NeonButton></div>
          </form>
        </FuturisticModal>
      )}
    </div>
  );
}
