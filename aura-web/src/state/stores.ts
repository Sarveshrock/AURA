import { createStore, createRecordStore, recordStores } from './store';
import type { TaskItem } from '../data/tasks';
import type { CalendarEvent } from '../data/events';
import type { CartLine, Product, Subscription } from '../data/products';
import type { Automation } from '../data/automations';
import type { Memory } from '../data/memories';
import type { Transaction } from '../data/transactions';
import type { Budget } from '../data/budgets';
import type { Goal } from '../data/goals';
import type { PlanId } from '../data/pricingPlans';
import type { Paper, ResearchProject } from '../data/research';
import type { Booking, TripPlan } from '../data/trips';
import type { DayLog, Habit, Meal, Metric, PeriodEntry, PeriodPrefs, PlanItem } from '../data/wellness';

/**
 * App state. Every list below is persisted per-user through the backend
 * (`/records/:collection` -> Supabase, protected by RLS) and starts empty.
 */
export const tasksStore = createRecordStore<TaskItem>('tasks');
export const eventsStore = createRecordStore<CalendarEvent>('events');
export const cartStore = createRecordStore<CartLine>('cart');
export const wishlistStore = createRecordStore<Product>('wishlist');
export const subscriptionsStore = createRecordStore<Subscription>('subscriptions');
export const automationsStore = createRecordStore<Automation>('automations');
export const memoriesStore = createRecordStore<Memory>('memories');
export const transactionsStore = createRecordStore<Transaction>('transactions');
export const budgetsStore = createRecordStore<Budget>('budgets');
export const goalsStore = createRecordStore<Goal>('goals');
export const savedPapersStore = createRecordStore<Paper>('papers');
export const projectsStore = createRecordStore<ResearchProject>('research_projects');
export const bookingsStore = createRecordStore<Booking>('bookings');
export const tripsStore = createRecordStore<TripPlan>('trips');
export const wellnessPlanStore = createRecordStore<PlanItem>('wellness_plan');
export const metricsStore = createRecordStore<Metric>('wellness_metrics');
export const dayLogsStore = createRecordStore<DayLog>('wellness_logs');
export const mealsStore = createRecordStore<Meal>('wellness_meals');
export interface AgentSetting { id: string; enabled: boolean; autonomy: number }
export const agentSettingsStore = createRecordStore<AgentSetting>('agent_settings');
/** Answers from the onboarding screen: what the user wants help with and their routine. Sent to AURA as context. */
export interface Profile { id: string; goals: string[]; routine: Record<string, string>; preferences: Record<string, string> }
export const profileStore = createRecordStore<Profile>('profile');

export interface Preferences { id: string; responseStyle: 'Balanced' | 'Concise' | 'Detailed' }
export const preferencesStore = createRecordStore<Preferences>('preferences');
export const periodStore = createRecordStore<PeriodEntry>('wellness_period');
export const periodPrefsStore = createRecordStore<PeriodPrefs>('wellness_period_prefs');
export const habitsStore = createRecordStore<Habit>('wellness_habits');

export interface RunLog { id: string; name: string; when: string; status: 'Completed' | 'Failed' | 'Awaiting approval'; summary?: string }
export const runsStore = createRecordStore<RunLog>('automation_runs');

export const planStore = createStore<PlanId>('free');

/** Clear every persisted store (e.g. after sign-out). */
export const resetAllStores = () => recordStores.forEach((s) => s.reset());
