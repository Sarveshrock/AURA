import { ShoppingBag, ShoppingCart, Laptop, Shirt, Sparkle, HeartPulse, Home, BookOpen, Gift, Dumbbell, type LucideIcon } from 'lucide-react';
import type { Tone } from '../components/ui';

export type ProductCategory = 'Groceries' | 'Electronics' | 'Fashion' | 'Beauty' | 'Health' | 'Home & Living' | 'Books' | 'Gifts' | 'Sports';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  rating: number;
  reviews: string;
  price: number;
  mrp?: number;
  badge?: 'Best Deal' | 'Popular';
  provider: string;
  unit?: string;
}

export const categories: { label: 'All' | ProductCategory; icon: LucideIcon; tone: Tone }[] = [
  { label: 'All', icon: ShoppingBag, tone: 'blue' },
  { label: 'Groceries', icon: ShoppingCart, tone: 'green' },
  { label: 'Electronics', icon: Laptop, tone: 'blue' },
  { label: 'Fashion', icon: Shirt, tone: 'pink' },
  { label: 'Beauty', icon: Sparkle, tone: 'magenta' },
  { label: 'Health', icon: HeartPulse, tone: 'green' },
  { label: 'Home & Living', icon: Home, tone: 'violet' },
  { label: 'Books', icon: BookOpen, tone: 'violet' },
  { label: 'Gifts', icon: Gift, tone: 'magenta' },
  { label: 'Sports', icon: Dumbbell, tone: 'violet' },
];

/** DEMO DATA — AURA hands off to providers; it is not a marketplace. */
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Noise Air Buds Pro', category: 'Electronics', image: '/aura/p/earbuds.jpg', rating: 4.4, reviews: '12k', price: 2499, mrp: 4999, badge: 'Best Deal', provider: 'Amazon' },
  { id: 'p2', name: 'MacBook Air M3', category: 'Electronics', image: '/aura/p/laptop.jpg', rating: 4.6, reviews: '8k', price: 89990, mrp: 99990, badge: 'Popular', provider: 'Flipkart' },
  { id: 'p3', name: 'Optimum Nutrition Whey Protein', category: 'Health', image: '/aura/p/whey.jpg', rating: 4.5, reviews: '20k', price: 5499, mrp: 6999, provider: 'Amazon', unit: '₹275 / 100g' },
  { id: 'p4', name: 'Nike Air Force 1', category: 'Fashion', image: '/aura/p/shoe.jpg', rating: 4.3, reviews: '15k', price: 7495, provider: 'Nike' },
  { id: 'p5', name: 'boAt Wave Sigma 3', category: 'Electronics', image: '/aura/p/watch.jpg', rating: 4.4, reviews: '30k', price: 1799, mrp: 2999, provider: 'Flipkart' },
  { id: 'p6', name: 'Face Wash (Reorder)', category: 'Beauty', image: '/aura/p/facewash.jpg', rating: 4.2, reviews: '6k', price: 799, provider: 'Nykaa' },
  { id: 'p7', name: 'Daily Multivitamins', category: 'Health', image: '/aura/p/multivit.jpg', rating: 4.3, reviews: '9k', price: 649, mrp: 799, provider: 'Amazon' },
  { id: 'p8', name: 'Organic Green Tea', category: 'Groceries', image: '/aura/p/greentea.jpg', rating: 4.1, reviews: '4k', price: 349, provider: 'BigBasket' },
];

export interface Subscription { id: string; productId: string; name: string; image: string; every: string; next: string; active: boolean }
export const mockSubscriptions: Subscription[] = [
  { id: 's1', productId: 'p6', name: 'Face Wash', image: '/aura/p/facewash.jpg', every: 'Every 2 months', next: 'Nov 14, 2025', active: true },
  { id: 's2', productId: 'p7', name: 'Multivitamins', image: '/aura/p/multivit.jpg', every: 'Every month', next: 'Oct 28, 2025', active: true },
  { id: 's3', productId: 'p3', name: 'Protein Powder', image: '/aura/p/protein.jpg', every: 'Every month', next: 'Oct 25, 2025', active: true },
  { id: 's4', productId: 'p8', name: 'Green Tea', image: '/aura/p/greentea.jpg', every: 'Every 3 months', next: 'Dec 1, 2025', active: true },
];

export const initialCart: Record<string, number> = { p3: 1, p4: 1, p6: 1 };
