/**
 * DEMO DATA — used while backend/integrations are not connected.
 * Every screen that renders from this module shows a <DemoFlag />.
 */
import {
  Plane, ShoppingCart, CalendarCheck, BookOpen, IndianRupee, Heart, MessageCircle, BrainCircuit, Utensils, Shield,
  Network, ListTodo, type LucideIcon,
} from 'lucide-react';
import type { Tone } from '../components/ui';

export const user = { name: 'Sarvesh', initials: 'S', plan: 'Free Plan', city: 'Bengaluru', avatar: '/aura/p/user.jpg' };

export type AgentStatus = 'active' | 'analyzing' | 'idle' | 'standby' | 'learning' | 'completed';

export interface Agent {
  id: string;
  name: string;
  icon: LucideIcon;
  tone: Tone;
  status: AgentStatus;
  purpose: string;
  task: string;
  capabilities: string[];
  tools: string[];
  permission: 'Suggest' | 'Prepare' | 'Restricted Execute' | 'Explicit Approval';
  lastActivity: string;
}

export const agents: Agent[] = [
  { id: 'core', name: 'Core Coordinator', icon: Network, tone: 'cyan', status: 'active', purpose: 'Orchestrates, plans and coordinates all agents', task: 'Coordinating final plan…', capabilities: ['Orchestration', 'Planning', 'Conflict resolution'], tools: ['Event Bus', 'Decision Engine'], permission: 'Prepare', lastActivity: '10:14 AM' },
  { id: 'travel', name: 'Travel Agent', icon: Plane, tone: 'blue', status: 'active', purpose: 'Plans, compares, and books your travel itineraries', task: 'Finding best flight options for Bangalore', capabilities: ['Flight Search & Booking', 'Hotel Recommendations', 'Cost Comparison', 'Itinerary Planning', 'Visa & Travel Document Info', 'Real-time Travel Updates'], tools: ['MakeMyTrip', 'Google Flights', 'Uber', 'Ola', 'IRCTC'], permission: 'Explicit Approval', lastActivity: '09:12 AM' },
  { id: 'productivity', name: 'Productivity Agent', icon: CalendarCheck, tone: 'teal', status: 'analyzing', purpose: 'Manages your tasks, schedule and focus', task: 'Checking schedule conflicts', capabilities: ['Task breakdown', 'Focus blocks', 'Prioritization'], tools: ['Google Calendar', 'Notion'], permission: 'Prepare', lastActivity: '10:12 AM' },
  { id: 'research', name: 'Research Agent', icon: BookOpen, tone: 'violet', status: 'idle', purpose: 'Finds and analyzes information', task: 'Gathering interview preparation resources', capabilities: ['Paper discovery', 'Summaries', 'Citations'], tools: ['arXiv', 'Semantic Scholar'], permission: 'Suggest', lastActivity: '09:58 AM' },
  { id: 'finance', name: 'Finance Agent', icon: IndianRupee, tone: 'green', status: 'active', purpose: 'Monitors budget and expenses', task: 'Checking budget and expenses', capabilities: ['Budget tracking', 'Bill reminders', 'Spending insights'], tools: ['Bank SMS parser'], permission: 'Explicit Approval', lastActivity: '10:13 AM' },
  { id: 'shopping', name: 'Shopping Agent', icon: ShoppingCart, tone: 'amber', status: 'standby', purpose: 'Tracks orders and reorders essentials', task: 'Monitoring essential reorders', capabilities: ['Price comparison', 'Unit price normalization', 'Reorder tracking'], tools: ['Amazon', 'Flipkart'], permission: 'Explicit Approval', lastActivity: '09:41 AM' },
  { id: 'wellness', name: 'Wellness Agent', icon: Heart, tone: 'magenta', status: 'active', purpose: 'Tracks routines and suggests rest', task: 'Tracking your routine and suggesting rest time', capabilities: ['Routines', 'Hydration', 'Sleep'], tools: ['Health Connect'], permission: 'Suggest', lastActivity: '08:30 AM' },
  { id: 'communication', name: 'Communication Agent', icon: MessageCircle, tone: 'blue', status: 'active', purpose: 'Drafts and manages messages', task: 'Drafting email for interview confirmation', capabilities: ['Email drafting', 'Summaries', 'Follow-ups'], tools: ['Gmail', 'Slack'], permission: 'Explicit Approval', lastActivity: '10:13 AM' },
  { id: 'memory', name: 'Memory Agent', icon: BrainCircuit, tone: 'cyan', status: 'learning', purpose: 'Remembers your preferences and context', task: 'Updating your preferences and context', capabilities: ['Recall', 'Categorization'], tools: ['Supabase pgvector'], permission: 'Prepare', lastActivity: '10:10 AM' },
  { id: 'food', name: 'Food Agent', icon: Utensils, tone: 'red', status: 'completed', purpose: 'Finds best food options and orders for you', task: 'Suggested lunch options near you', capabilities: ['Menu search', 'Diet preferences'], tools: ['Swiggy', 'Zomato'], permission: 'Explicit Approval', lastActivity: '09:30 AM' },
  { id: 'calendar', name: 'Calendar Agent', icon: ListTodo, tone: 'teal', status: 'idle', purpose: 'Detects conflicts and protects focus time', task: 'Watching for new invites', capabilities: ['Conflict detection', 'Travel buffers'], tools: ['Google Calendar'], permission: 'Prepare', lastActivity: '09:00 AM' },
  { id: 'security', name: 'Security Agent', icon: Shield, tone: 'violet', status: 'active', purpose: 'Keeps your data safe and private', task: 'Auditing integration scopes', capabilities: ['Scope audit', 'Anomaly alerts'], tools: ['Audit log'], permission: 'Suggest', lastActivity: '07:00 AM' },
];

export const agentById = (id: string) => agents.find((a) => a.id === id);

export const statusTone: Record<AgentStatus, 'green' | 'amber' | 'cyan' | 'violet' | 'off'> = {
  active: 'green', analyzing: 'amber', idle: 'off', standby: 'amber', learning: 'violet', completed: 'cyan',
};

export interface Task {
  id: string;
  title: string;
  time: string;
  agent: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low';
  tags: { label: string; tone: Tone }[];
  day: 'today' | 'tomorrow' | 'upcoming';
}

export const initialTasks: Task[] = [
  { id: 't1', title: 'Attend interview (Bangalore)', time: '10:00 AM – 11:00 AM', agent: 'travel', done: true, priority: 'High', tags: [{ label: 'Career', tone: 'blue' }], day: 'today' },
  { id: 't2', title: 'Review project presentation', time: '11:30 AM – 12:30 PM', agent: 'productivity', done: true, priority: 'Medium', tags: [{ label: 'Work', tone: 'blue' }], day: 'today' },
  { id: 't3', title: 'Complete hackathon presentation', time: '2:00 PM – 4:00 PM', agent: 'productivity', done: false, priority: 'High', tags: [{ label: 'Hackathon', tone: 'violet' }, { label: 'High', tone: 'red' }], day: 'today' },
  { id: 't4', title: 'Work meeting (Team Sync)', time: '4:00 PM – 5:00 PM', agent: 'communication', done: false, priority: 'High', tags: [{ label: 'Work', tone: 'blue' }, { label: 'Meeting', tone: 'blue' }], day: 'today' },
  { id: 't5', title: 'Gym workout', time: '7:00 PM – 8:00 PM', agent: 'wellness', done: false, priority: 'Low', tags: [{ label: 'Health', tone: 'green' }], day: 'today' },
  { id: 't6', title: 'Read research paper on Agentic AI', time: '9:00 PM – 9:30 PM', agent: 'research', done: false, priority: 'Low', tags: [{ label: 'Learning', tone: 'violet' }], day: 'today' },
  { id: 't7', title: 'Travel booking for Pune', time: '10:00 AM', agent: 'travel', done: false, priority: 'High', tags: [{ label: 'Travel', tone: 'cyan' }], day: 'tomorrow' },
  { id: 't8', title: 'Prepare weekly report', time: '1:00 PM', agent: 'productivity', done: false, priority: 'Medium', tags: [{ label: 'Work', tone: 'blue' }, { label: 'Medium', tone: 'amber' }], day: 'tomorrow' },
  { id: 't9', title: 'Team standup', time: '4:00 PM', agent: 'communication', done: false, priority: 'Low', tags: [{ label: 'Meeting', tone: 'blue' }], day: 'tomorrow' },
  { id: 't10', title: 'Grocery shopping', time: 'Oct 15 · 12:00 PM', agent: 'shopping', done: false, priority: 'Low', tags: [{ label: 'Errand', tone: 'amber' }], day: 'upcoming' },
  { id: 't11', title: 'Client call (Capco)', time: 'Oct 16 · 11:00 AM', agent: 'communication', done: false, priority: 'Medium', tags: [{ label: 'Work', tone: 'blue' }], day: 'upcoming' },
  { id: 't12', title: 'Pay credit card bill', time: 'Oct 17 · 9:00 AM', agent: 'finance', done: false, priority: 'High', tags: [{ label: 'Finance', tone: 'green' }], day: 'upcoming' },
];

export interface CalEvent { day: number; title: string; time: string; tone: Tone }
export const calendarEvents: CalEvent[] = [
  { day: 1, title: 'Team Standup', time: '10:00 AM', tone: 'violet' },
  { day: 3, title: 'Gym', time: '7:00 AM', tone: 'green' },
  { day: 6, title: 'Project Work', time: '11:00 AM', tone: 'blue' },
  { day: 8, title: 'Learning', time: '2:00 PM', tone: 'magenta' },
  { day: 10, title: 'Travel Plan', time: '5:00 PM', tone: 'red' },
  { day: 14, title: 'Client Meet', time: '11:00 AM', tone: 'blue' },
  { day: 14, title: 'Team Sync', time: '4:00 PM', tone: 'violet' },
  { day: 16, title: 'Doctor Appointment', time: '4:00 PM', tone: 'teal' },
  { day: 20, title: 'Hackathon Prep', time: '6:00 PM', tone: 'violet' },
  { day: 24, title: 'Movie Night', time: '8:00 PM', tone: 'blue' },
  { day: 28, title: 'Presentation', time: '10:00 AM', tone: 'pink' },
  { day: 31, title: 'Birthday', time: 'All Day', tone: 'amber' },
];

export const activityFeed = [
  { agent: 'travel', text: 'Found 3 flight options (₹3,200 – ₹5,800)', time: '10:11 AM' },
  { agent: 'finance', text: 'You are within budget for Option 2', time: '10:10 AM' },
  { agent: 'productivity', text: 'Rescheduled work meeting to 4:00 PM', time: '10:09 AM' },
  { agent: 'communication', text: 'Email drafted. Waiting for your approval.', time: '10:09 AM' },
  { agent: 'core', text: 'All agents aligned on proposed plan.', time: '10:08 AM' },
];
