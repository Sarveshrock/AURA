/**
 * Client-side API boundary. The UI talks only to `AuraService`; the Node BFF
 * (which fronts Supabase + the Python AI runtime) implements it over REST/WebSocket.
 * No API keys live in the frontend. Until VITE_API_URL is set, a clearly-labelled
 * mock implementation is used.
 */

export type StepStatus = 'done' | 'processing' | 'pending';

export interface PlanStep { label: string; status: StepStatus }
export interface ResultCard { title: string; sub: string; kind: 'travel' | 'prep' | 'schedule' | 'cost' }

export interface ChatReply {
  intro: string;
  agents: string[];
  steps: PlanStep[];
  summary: string;
  cards: ResultCard[];
  actions: string[];
  mock: boolean;
}

export interface AuraService {
  chat(message: string, onStep?: (steps: PlanStep[]) => void): Promise<ChatReply>;
  approve(actionId: string): Promise<{ verified: boolean; message: string }>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pickAgents(msg: string): string[] {
  const m = msg.toLowerCase();
  const set = new Set<string>();
  if (/(trip|travel|flight|goa|bangalore|interview)/.test(m)) set.add('travel');
  if (/(budget|cost|price|money|₹|under)/.test(m) || set.has('travel')) set.add('finance');
  if (/(plan|schedule|day|task|prepare|interview)/.test(m)) set.add('productivity');
  if (/(research|company|paper|learn|interview)/.test(m)) set.add('research');
  if (/(buy|shop|laptop|order|grocer)/.test(m)) set.add('shopping');
  if (/(email|message|mail)/.test(m)) set.add('communication');
  if (/(food|lunch|dinner)/.test(m)) set.add('food');
  if (set.size === 0) set.add('productivity');
  return [...set];
}

const mockService: AuraService = {
  async chat(message, onStep) {
    const agents = pickAgents(message);
    const labels: Record<string, string> = {
      travel: 'Find best travel options',
      finance: 'Check budget and suggest options',
      productivity: 'Check your calendar for schedule conflicts',
      research: 'Research the context you need',
      shopping: 'Compare products across providers',
      communication: 'Summarize and draft messages',
      food: 'Compare food options nearby',
    };
    const steps: PlanStep[] = agents.map((a) => ({ label: labels[a], status: 'pending' }));
    steps.push({ label: 'Create a preparation plan', status: 'pending' });
    for (let i = 0; i < steps.length; i++) {
      steps[i] = { ...steps[i], status: 'processing' };
      onStep?.([...steps]);
      await sleep(650);
      steps[i] = { ...steps[i], status: 'done' };
      onStep?.([...steps]);
    }
    return {
      intro: `Got it! I'll coordinate with ${agents.length} agent${agents.length > 1 ? 's' : ''} to handle this. Here's what I'll do:`,
      agents,
      steps,
      summary: "I've prepared a plan. Here's a quick summary — nothing has been booked or sent yet.",
      cards: [
        { title: 'Travel Options', sub: '3 options found', kind: 'travel' },
        { title: 'Preparation', sub: 'Personalized plan', kind: 'prep' },
        { title: 'Schedule', sub: '1 conflict detected', kind: 'schedule' },
        { title: 'Estimated Cost', sub: '₹3,200 – ₹5,800', kind: 'cost' },
      ],
      actions: ['Show full plan', 'Book tickets (with approval)', 'Start preparation', 'Adjust budget'],
      mock: true,
    };
  },
  async approve() {
    await sleep(800);
    // Mock mode never claims an external action succeeded.
    return { verified: false, message: 'Demo mode: no provider connected, so nothing was executed.' };
  },
};

export const aura: AuraService = mockService;
