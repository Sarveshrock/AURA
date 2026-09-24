import type { Tone } from '../components/ui';

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskDay = 'today' | 'tomorrow' | 'later';

export interface TaskItem {
  id: string;
  title: string;
  categories: string[];
  priority: Priority;
  day: TaskDay;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  start?: string; // "11:00 AM"
  end?: string;
  flagged: boolean;
  done: boolean;
  notes?: string;
}

export const categoryTone: Record<string, Tone> = {
  Work: 'blue', Meeting: 'blue', Hackathon: 'violet', Health: 'green', Learning: 'violet', Travel: 'cyan', Personal: 'magenta', Errand: 'amber', Finance: 'green',
};
export const priorityTone: Record<Priority, Tone> = { High: 'red', Medium: 'amber', Low: 'blue' };
export const allCategories = ['Work', 'Meeting', 'Hackathon', 'Health', 'Learning', 'Travel', 'Personal', 'Errand', 'Finance'] as const;

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

/** DEMO DATA */
export const mockTasks: TaskItem[] = [
  { id: 'tk1', title: 'Client meeting with Tech Team', categories: ['Work', 'Meeting'], priority: 'High', day: 'today', date: iso(0), start: '11:00 AM', end: '12:00 PM', flagged: true, done: true },
  { id: 'tk2', title: 'Complete hackathon presentation', categories: ['Hackathon'], priority: 'High', day: 'today', date: iso(0), start: '2:00 PM', end: '4:00 PM', flagged: false, done: false },
  { id: 'tk3', title: 'Gym workout', categories: ['Health'], priority: 'Low', day: 'today', date: iso(0), start: '7:00 PM', end: '8:00 PM', flagged: false, done: false },
  { id: 'tk4', title: 'Review pull requests', categories: ['Work'], priority: 'Medium', day: 'today', date: iso(0), start: '8:00 PM', end: '9:00 PM', flagged: true, done: false },
  { id: 'tk5', title: 'Read research paper on Agentic AI', categories: ['Learning'], priority: 'Low', day: 'today', date: iso(0), start: '9:00 PM', end: '9:30 PM', flagged: false, done: false },
  { id: 'tk6', title: 'Travel booking for Pune', categories: ['Travel'], priority: 'High', day: 'tomorrow', date: iso(1), start: '10:00 AM', flagged: true, done: false },
  { id: 'tk7', title: 'Prepare weekly report', categories: ['Work'], priority: 'Medium', day: 'tomorrow', date: iso(1), start: '1:00 PM', flagged: true, done: false },
  { id: 'tk8', title: 'Team standup', categories: ['Meeting'], priority: 'Low', day: 'tomorrow', date: iso(1), start: '4:00 PM', flagged: false, done: false },
  { id: 'tk9', title: 'Renew passport documents', categories: ['Personal'], priority: 'Medium', day: 'later', date: iso(4), start: '11:00 AM', flagged: false, done: false },
  { id: 'tk10', title: 'Call mom', categories: ['Personal'], priority: 'Low', day: 'later', date: iso(5), start: '7:30 PM', flagged: false, done: true },
];
