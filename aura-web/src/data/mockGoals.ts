import { Home, Plane, Car, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';

/** DEMO DATA */
export interface Goal { id: string; name: string; icon: LucideIcon; tone: Tone; saved: number; target: number }

export const mockGoals: Goal[] = [
  { id: 'g1', name: 'Buy a House', icon: Home, tone: 'violet', saved: 800000, target: 5000000 },
  { id: 'g2', name: 'Europe Trip', icon: Plane, tone: 'blue', saved: 120000, target: 300000 },
  { id: 'g3', name: 'New Car', icon: Car, tone: 'violet', saved: 250000, target: 1000000 },
];
