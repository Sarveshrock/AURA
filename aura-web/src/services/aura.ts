/**
 * Client-side API boundary. The UI talks only to `aura`; the Node backend
 * (fronting Supabase and the Python AI runtime) implements it. No API keys
 * live in the frontend.
 */
import { apiGet, apiSend } from './api';
import { recordAgentActivity } from '../state/agentActivity';
import { preferencesStore } from '../state/stores';

export type StepStatus = 'done' | 'processing' | 'pending';
export interface PlanStep { label: string; status: StepStatus }

export interface ChatReply {
  /** The assistant's reply text. */
  text: string;
  /** Agents the coordinator consulted for this message. */
  agents: string[];
}

export interface PlanTask { title: string; agent?: string | null; dependencies?: string[] }
export interface DecisionOption { title: string; tradeoffs: string; risk: string }
export interface Decision { options: DecisionOption[]; recommendation: string; agentsConsulted?: string[] }

export interface ConverseAction { type: string; args: Record<string, unknown> }
export interface ConverseReply { say: string; actions: ConverseAction[] }

export const aura = {
  /** Fast single-call companion reply (short, spoken style) that may also ask the app to do things. See ai-service/app/routers/companion.py. */
  async converse(message: string, opts: { context?: string; history?: { role: 'user' | 'aura'; text: string }[]; pending?: string } = {}): Promise<ConverseReply> {
    const res = await apiSend<{ say: string; do: ConverseAction[] }>('POST', '/chat/converse', { message, ...opts });
    return { say: res.say, actions: res.do ?? [] };
  },

  /** `context` is a short summary of the user's own data for the domain being discussed. */
  async chat(message: string, context?: string): Promise<ChatReply> {
    const style = preferencesStore.get()[0]?.responseStyle;
    const styleNote = style && style !== 'Balanced' ? `\n\n(Reply style: ${style.toLowerCase()}.)` : '';
    const res = await apiSend<{ reply: string; agentsConsulted: string[] }>('POST', '/chat', {
      message: (context ? `${message}\n\nContext from the user's data:\n${context}` : message) + styleNote,
    });
    if (res.agentsConsulted.length) recordAgentActivity(res.agentsConsulted, message.slice(0, 80));
    return { text: res.reply, agents: res.agentsConsulted };
  },

  async plan(goal: string): Promise<PlanTask[]> {
    const res = await apiSend<{ tasks: PlanTask[] }>('POST', '/chat/plan', { goal });
    return res.tasks;
  },

  async decide(situation: string, context?: Record<string, unknown>): Promise<Decision> {
    return apiSend<Decision>('POST', '/decisions/evaluate', { situation, context });
  },

  /** Records the user's approval. No provider integration executes it, so it never claims success. */
  async approve(action: string, payload: Record<string, unknown> = {}): Promise<{ verified: boolean; message: string }> {
    await apiSend('POST', '/approvals', { action, payload, status: 'approved' });
    return { verified: false, message: 'Approval recorded. No provider is connected for this action, so nothing was executed.' };
  },

  health: () => apiGet<{ status: string; dependencies: Record<string, string> }>('/health'),
};
