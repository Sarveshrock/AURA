import { Mail, Calendar, FileText, ShoppingCart, Plane, IndianRupee, Dumbbell, FolderOpen, Sun, Link2, Wallet, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';

export type AutoCategory = 'Productivity' | 'Communication' | 'Lifestyle' | 'Finance' | 'Travel' | 'Shopping' | 'Custom';

export interface Automation {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  tags: string[];
  category: AutoCategory;
  schedule: string;
  active: boolean;
  /** app → app flow for featured cards */
  from?: string;
  to?: string;
  featured?: boolean;
  lastRun?: string;
  trigger?: string;
  steps?: string[];
  needsApproval?: boolean;
}

/** DEMO DATA — shared by Automation Hub + Automations via automationsStore */
export const mockAutomations: Automation[] = [
  { id: 'a1', name: 'Email to Notes', description: 'Automatically save important emails to Notion.', icon: Mail, tone: 'red', tags: ['Communication', 'Productivity'], category: 'Communication', schedule: 'Runs on event', active: true, from: 'Gmail', to: 'Notion', featured: true, lastRun: 'Today, 09:02 AM' },
  { id: 'a2', name: 'Daily Planner', description: 'Create your daily plan from ChatGPT and add to Google Calendar.', icon: Calendar, tone: 'teal', tags: ['Productivity', 'Calendar'], category: 'Productivity', schedule: 'Runs daily • 7:30 AM', active: true, from: 'ChatGPT', to: 'Google Calendar', featured: true, lastRun: 'Today, 07:30 AM' },
  { id: 'a3', name: 'Track Orders', description: 'Track your shopping orders and get notified on delivery.', icon: ShoppingCart, tone: 'violet', tags: ['Shopping', 'Notifications'], category: 'Shopping', schedule: 'Runs on event', active: true, from: 'Shopping', to: 'Amazon', featured: true, lastRun: 'Yesterday, 06:10 PM' },
  { id: 'a4', name: 'Code to Slack', description: 'Get GitHub updates in your Slack channel.', icon: Link2, tone: 'magenta', tags: ['Development', 'Communication'], category: 'Communication', schedule: 'Runs on event', active: true, from: 'GitHub', to: 'Slack', featured: true, lastRun: 'Today, 10:15 AM' },
  { id: 'a5', name: 'Daily Email Summary', description: 'Get a daily summary of important emails at 8 AM.', icon: Mail, tone: 'magenta', tags: ['Email', 'Productivity'], category: 'Productivity', schedule: 'Runs daily • 8:00 AM', active: true, lastRun: 'Oct 14, 2025 • 8:00 AM' },
  { id: 'a6', name: 'Calendar Reminder', description: 'Remind me 30 mins before important meetings.', icon: Calendar, tone: 'red', tags: ['Calendar', 'Personal'], category: 'Productivity', schedule: 'Runs daily • 9:30 AM', active: true, lastRun: 'Oct 14, 2025 • 9:30 AM' },
  { id: 'a7', name: 'Auto Save Notes', description: 'Save important chat notes to Google Drive.', icon: FileText, tone: 'green', tags: ['Notes', 'Google Drive'], category: 'Productivity', schedule: 'Runs on event', active: true, lastRun: 'Oct 14, 2025 • 9:15 AM' },
  { id: 'a8', name: 'Shopping Assistant', description: 'Reorder my essentials when stock is low.', icon: ShoppingCart, tone: 'magenta', tags: ['Shopping', 'Lifestyle'], category: 'Shopping', schedule: 'Runs weekly • Sunday 10:00 AM', active: true, lastRun: 'Oct 12, 2025 • 10:00 AM', needsApproval: true },
  { id: 'a9', name: 'Travel Planner', description: 'Plan my next trip with best flights, hotels and itinerary.', icon: Plane, tone: 'blue', tags: ['Travel', 'Planning'], category: 'Travel', schedule: 'Runs on request', active: true, lastRun: 'Oct 10, 2025 • 6:20 PM', needsApproval: true },
  { id: 'a10', name: 'Expense Tracker', description: 'Track daily expenses from SMS and categorize automatically.', icon: IndianRupee, tone: 'green', tags: ['Finance', 'Tracking'], category: 'Finance', schedule: 'Runs daily • 10:00 PM', active: true, lastRun: 'Oct 11, 2025 • 10:00 PM' },
  { id: 'a11', name: 'Workout Reminder', description: 'Remind me to workout and track my progress.', icon: Dumbbell, tone: 'red', tags: ['Health', 'Fitness'], category: 'Lifestyle', schedule: 'Runs daily • 7:00 AM', active: false, lastRun: '1 day ago' },
  { id: 'a12', name: 'File Organizer', description: 'Sort and organize files in my drive automatically.', icon: FolderOpen, tone: 'violet', tags: ['Files', 'Productivity'], category: 'Productivity', schedule: 'Runs on event', active: true, lastRun: '2 days ago' },
];

export interface AutoTemplate { id: string; name: string; description: string; icon: LucideIcon; tone: Tone; tags: string[]; category: AutoCategory; schedule: string }

export const recommendedAutomations: AutoTemplate[] = [
  { id: 't1', name: 'Auto Backup Files', description: 'Backup your important files to Google Drive every day.', icon: FolderOpen, tone: 'blue', tags: ['File Management', 'Cloud'], category: 'Productivity', schedule: 'Runs daily • 11:00 PM' },
  { id: 't2', name: 'Meeting Summarizer', description: 'Summarize meeting notes and send to your email.', icon: FileText, tone: 'violet', tags: ['Productivity', 'Communication'], category: 'Communication', schedule: 'Runs on event' },
  { id: 't3', name: 'News Digest', description: 'Get daily AI-curated news based on your interests.', icon: FileText, tone: 'magenta', tags: ['Information', 'AI'], category: 'Lifestyle', schedule: 'Runs daily • 8:00 AM' },
  { id: 't4', name: 'Health Check-in', description: 'Log your health data and get weekly insights.', icon: Dumbbell, tone: 'pink', tags: ['Health', 'Lifestyle'], category: 'Lifestyle', schedule: 'Runs weekly • Sunday 9:00 AM' },
];

export const automationTemplates: AutoTemplate[] = [
  { id: 'tp1', name: 'Morning Routine', description: 'Get weather, news, and tasks every morning.', icon: Sun, tone: 'amber', tags: ['Lifestyle'], category: 'Lifestyle', schedule: 'Runs daily • 7:00 AM' },
  { id: 'tp2', name: 'Content Creator', description: 'Summarize, create drafts and schedule posts.', icon: FileText, tone: 'pink', tags: ['Communication'], category: 'Communication', schedule: 'Runs on request' },
  { id: 'tp3', name: 'Study Buddy', description: 'Organize study plan and track progress.', icon: FileText, tone: 'violet', tags: ['Productivity'], category: 'Productivity', schedule: 'Runs daily • 6:00 PM' },
  { id: 'tp4', name: 'Health Tracker', description: 'Log health data and get personalized tips.', icon: Dumbbell, tone: 'pink', tags: ['Lifestyle'], category: 'Lifestyle', schedule: 'Runs daily • 9:00 PM' },
  { id: 'tp5', name: 'Bill Reminders', description: 'Remind me 3 days before any bill is due.', icon: Wallet, tone: 'green', tags: ['Finance'], category: 'Finance', schedule: 'Runs daily • 9:00 AM' },
];
