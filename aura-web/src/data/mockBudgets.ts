import { Utensils, ShoppingBag, Plane, Zap, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';
import type { TxCategory } from './mockTransactions';

/** DEMO DATA */
export interface Budget { id: string; category: TxCategory; icon: LucideIcon; tone: Tone; spent: number; limit: number }

export const mockBudgets: Budget[] = [
  { id: 'bg1', category: 'Food & Dining', icon: Utensils, tone: 'pink', spent: 8500, limit: 10000 },
  { id: 'bg2', category: 'Shopping', icon: ShoppingBag, tone: 'blue', spent: 6200, limit: 10000 },
  { id: 'bg3', category: 'Travel', icon: Plane, tone: 'teal', spent: 5000, limit: 8000 },
  { id: 'bg4', category: 'Bills & Utilities', icon: Zap, tone: 'amber', spent: 4000, limit: 5000 },
];

export const expenseBreakdown = [
  { label: 'Food & Dining', value: 28, color: '#00E5A8' },
  { label: 'Shopping', value: 20, color: '#00AFFF' },
  { label: 'Travel', value: 15, color: '#FF7A45' },
  { label: 'Bills & Utilities', value: 12, color: '#FFC857' },
  { label: 'Subscriptions', value: 10, color: '#FF4FD8' },
  { label: 'Others', value: 15, color: '#8B5CFF' },
];
