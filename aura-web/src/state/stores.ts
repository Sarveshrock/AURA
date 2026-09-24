import { createStore } from './store';
import { mockTasks, type TaskItem } from '../data/mockTasks';
import { mockEvents, type CalendarEvent } from '../data/mockEvents';
import { initialCart, mockSubscriptions } from '../data/mockProducts';
import { mockAutomations, type Automation } from '../data/mockAutomations';
import { mockMemories, type Memory } from '../data/mockMemories';
import { mockTransactions, type Transaction } from '../data/mockTransactions';
import { mockBudgets, type Budget } from '../data/mockBudgets';
import { mockGoals, type Goal } from '../data/mockGoals';
import type { PlanId } from '../data/mockPricingPlans';

/** App-wide demo state. Replace initial values with API loaders when the backend lands. */
export const tasksStore = createStore<TaskItem[]>(mockTasks);
export const eventsStore = createStore<CalendarEvent[]>(mockEvents);
export const cartStore = createStore<Record<string, number>>(initialCart);
export const wishlistStore = createStore<string[]>(['p2']);
export const subscriptionsStore = createStore(mockSubscriptions);
export const automationsStore = createStore<Automation[]>(mockAutomations);
export const memoriesStore = createStore<Memory[]>(mockMemories);
export const transactionsStore = createStore<Transaction[]>(mockTransactions);
export const budgetsStore = createStore<Budget[]>(mockBudgets);
export const goalsStore = createStore<Goal[]>(mockGoals);
export const planStore = createStore<PlanId>('free');
export const savedPapersStore = createStore<string[]>([]);

export interface RunLog { id: string; name: string; when: string; status: 'Completed' | 'Failed' | 'Awaiting approval' }
export const runsStore = createStore<RunLog[]>([
  { id: 'rn1', name: 'Daily Email Summary', when: 'Oct 14, 2025 • 8:00 AM', status: 'Completed' },
  { id: 'rn2', name: 'Calendar Reminder', when: 'Oct 14, 2025 • 9:30 AM', status: 'Completed' },
  { id: 'rn3', name: 'Auto Save Notes', when: 'Oct 14, 2025 • 9:15 AM', status: 'Completed' },
  { id: 'rn4', name: 'Shopping Assistant', when: 'Oct 12, 2025 • 10:00 AM', status: 'Completed' },
  { id: 'rn5', name: 'Expense Tracker', when: 'Oct 11, 2025 • 10:00 PM', status: 'Completed' },
]);
