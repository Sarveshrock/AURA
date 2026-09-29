import { Home, Plane, Car, Target, GraduationCap, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';

export type GoalIcon = 'home' | 'plane' | 'car' | 'target' | 'education';
export interface Goal { id: string; name: string; icon: GoalIcon; tone: Tone; saved: number; target: number }

export const goalIcons: Record<GoalIcon, LucideIcon> = { home: Home, plane: Plane, car: Car, target: Target, education: GraduationCap };
