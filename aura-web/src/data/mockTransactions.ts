/** DEMO DATA — not real financial transactions. */
export type TxCategory = 'Shopping' | 'Food & Dining' | 'Income' | 'Travel' | 'Bills & Utilities' | 'Subscriptions' | 'Others';

export interface Transaction { id: string; merchant: string; logo: string; when: string; category: TxCategory; amount: number }

export const txTone: Record<TxCategory, 'violet' | 'red' | 'green' | 'blue' | 'amber' | 'magenta' | 'cyan'> = {
  Shopping: 'violet', 'Food & Dining': 'red', Income: 'green', Travel: 'blue', 'Bills & Utilities': 'amber', Subscriptions: 'magenta', Others: 'cyan',
};

export const mockTransactions: Transaction[] = [
  { id: 'x1', merchant: 'Amazon', logo: 'Amazon', when: 'Today, 10:24 AM', category: 'Shopping', amount: -2499 },
  { id: 'x2', merchant: 'Swiggy', logo: 'Swiggy', when: 'Yesterday, 08:15 PM', category: 'Food & Dining', amount: -450 },
  { id: 'x3', merchant: 'Salary', logo: 'Salary', when: 'Oct 12, 2025', category: 'Income', amount: 75000 },
  { id: 'x4', merchant: 'Uber', logo: 'Uber', when: 'Oct 11, 2025', category: 'Travel', amount: -320 },
  { id: 'x5', merchant: 'Electricity Board', logo: 'Bill', when: 'Oct 10, 2025', category: 'Bills & Utilities', amount: -1240 },
  { id: 'x6', merchant: 'Netflix', logo: 'Netflix', when: 'Oct 08, 2025', category: 'Subscriptions', amount: -649 },
];

/** Monthly expense totals Jan–Dec 2025 (₹) */
export const monthlyExpenses = [6100, 8400, 8200, 12100, 9800, 17900, 7600, 8100, 11200, 14600, 18400, 15200];
