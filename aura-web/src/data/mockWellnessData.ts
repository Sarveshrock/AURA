import { Flame, Dumbbell, Utensils, GlassWater, Footprints, Moon, Heart, Scale, Activity, Droplet, Wind, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';

/** DEMO DATA — self-reported / sample values. AURA does not diagnose medical conditions. */
export interface PlanItem { id: string; time: string; title: string; sub: string; icon: LucideIcon; tone: Tone; done: boolean; progress?: number; area: 'Mindfulness' | 'Fitness' | 'Nutrition' | 'Sleep' }
export const mockPlan: PlanItem[] = [
  { id: 'w1', time: '6:30 AM', title: 'Morning Meditation', sub: '10 minutes', icon: Flame, tone: 'red', done: true, progress: 78, area: 'Mindfulness' },
  { id: 'w2', time: '7:00 AM', title: 'Workout', sub: 'Full Body (30 min)', icon: Dumbbell, tone: 'magenta', done: false, area: 'Fitness' },
  { id: 'w3', time: '8:00 AM', title: 'Healthy Breakfast', sub: 'Oats, Fruits, Nuts', icon: Utensils, tone: 'magenta', done: false, area: 'Nutrition' },
  { id: 'w4', time: '1:00 PM', title: 'Drink Water', sub: '250 ml', icon: GlassWater, tone: 'cyan', done: true, area: 'Nutrition' },
  { id: 'w5', time: '7:00 PM', title: 'Evening Walk', sub: '20 minutes', icon: Footprints, tone: 'magenta', done: false, area: 'Fitness' },
  { id: 'w6', time: '10:00 PM', title: 'Sleep', sub: 'Target: 8 hours', icon: Moon, tone: 'violet', done: false, area: 'Sleep' },
];

export interface Metric { id: string; name: string; value: string; status: string; icon: LucideIcon; tone: Tone; good: boolean }
export const mockMetrics: Metric[] = [
  { id: 'm1', name: 'Heart Rate', value: '72 bpm', status: 'Normal', icon: Heart, tone: 'red', good: true },
  { id: 'm2', name: 'Weight', value: '68.5 kg', status: '-0.5 kg', icon: Scale, tone: 'blue', good: true },
  { id: 'm3', name: 'BMI', value: '22.4', status: 'Normal', icon: Activity, tone: 'amber', good: true },
  { id: 'm4', name: 'Blood Pressure', value: '118/76 mmHg', status: 'Normal', icon: Droplet, tone: 'red', good: true },
  { id: 'm5', name: 'Oxygen Level', value: '98%', status: 'Normal', icon: Wind, tone: 'teal', good: true },
];

/** Steps (k), calories (×100), sleep hrs ×10 — per day */
export const weekly = {
  This: { steps: [72, 64, 88, 58, 81, 90, 66], cal: [55, 70, 62, 80, 48, 76, 60], sleep: [60, 55, 72, 40, 65, 70, 58] },
  Last: { steps: [60, 58, 70, 66, 52, 84, 71], cal: [62, 50, 58, 72, 66, 58, 64], sleep: [52, 64, 60, 48, 70, 62, 55] },
};

export interface Meal { id: string; name: string; dish: string; kcal: number; image: string; eaten: boolean }
export const mockMeals: Meal[] = [
  { id: 'ml1', name: 'Breakfast', dish: 'Oats with fruits & nuts', kcal: 350, image: '/aura/p/meal-breakfast.jpg', eaten: true },
  { id: 'ml2', name: 'Lunch', dish: 'Grilled chicken bowl', kcal: 450, image: '/aura/p/meal-lunch.jpg', eaten: false },
  { id: 'ml3', name: 'Dinner', dish: 'Paneer salad', kcal: 400, image: '/aura/p/meal-dinner.jpg', eaten: false },
];

export const nutrition = [
  { label: 'Carbs', value: 50, color: '#00E5A8' },
  { label: 'Protein', value: 25, color: '#FF4FD8' },
  { label: 'Fats', value: 20, color: '#00AFFF' },
  { label: 'Fiber', value: 5, color: '#8B5CFF' },
];
