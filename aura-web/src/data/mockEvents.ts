import { Users, Dumbbell, Laptop, BookOpen, Plane, HeartPulse, Trophy, Clapperboard, FileText, Cake, Timer, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';

export type EventKind = 'meeting' | 'fitness' | 'work' | 'learning' | 'travel' | 'health' | 'event' | 'personal' | 'focus';

export interface CalendarEvent {
  id: string;
  title: string;
  /** yyyy-mm-dd */
  date: string;
  start: string; // "10:00 AM" or "All Day"
  end?: string;
  kind: EventKind;
  notes?: string;
}

export const kindMeta: Record<EventKind, { tone: Tone; icon: LucideIcon; label: string }> = {
  meeting: { tone: 'violet', icon: Users, label: 'Meeting' },
  fitness: { tone: 'green', icon: Dumbbell, label: 'Fitness' },
  work: { tone: 'blue', icon: Laptop, label: 'Work' },
  learning: { tone: 'magenta', icon: BookOpen, label: 'Learning' },
  travel: { tone: 'red', icon: Plane, label: 'Travel' },
  health: { tone: 'teal', icon: HeartPulse, label: 'Health' },
  event: { tone: 'violet', icon: Trophy, label: 'Event' },
  personal: { tone: 'blue', icon: Clapperboard, label: 'Personal' },
  focus: { tone: 'cyan', icon: Timer, label: 'Focus' },
};
// Presentation / birthday use distinct icons but reuse kinds
export const titleIcon: Record<string, LucideIcon> = { Presentation: FileText, Birthday: Cake };

/** DEMO DATA — October 2025 */
export const mockEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Team Standup', date: '2025-10-01', start: '10:00 AM', end: '10:30 AM', kind: 'meeting' },
  { id: 'e2', title: 'Gym', date: '2025-10-03', start: '7:00 AM', end: '8:00 AM', kind: 'fitness' },
  { id: 'e3', title: 'Project Work', date: '2025-10-06', start: '11:00 AM', end: '1:00 PM', kind: 'work' },
  { id: 'e4', title: 'Learning', date: '2025-10-08', start: '2:00 PM', end: '3:00 PM', kind: 'learning' },
  { id: 'e5', title: 'Travel Plan', date: '2025-10-10', start: '5:00 PM', end: '6:00 PM', kind: 'travel' },
  { id: 'e6', title: 'Client Meet', date: '2025-10-14', start: '11:00 AM', end: '12:00 PM', kind: 'work' },
  { id: 'e7', title: 'Doctor Appointment', date: '2025-10-16', start: '4:00 PM', end: '5:00 PM', kind: 'health' },
  { id: 'e8', title: 'Hackathon Prep', date: '2025-10-20', start: '6:00 PM', end: '8:00 PM', kind: 'event' },
  { id: 'e9', title: 'Movie Night', date: '2025-10-24', start: '8:00 PM', end: '11:00 PM', kind: 'personal' },
  { id: 'e10', title: 'Presentation', date: '2025-10-28', start: '10:00 AM', end: '11:00 AM', kind: 'learning' },
  { id: 'e11', title: 'Birthday', date: '2025-10-31', start: 'All Day', kind: 'event' },
];

export const DEMO_TODAY = '2025-10-14';
