import { apiGet } from './api';
import type { Product } from '../data/products';

interface ApiProduct { title: string; price: number | null; currency: string; source: string; link: string; thumbnail?: string | null; rating?: number | null; reviews?: number | null }

const productId = (p: ApiProduct) => `${p.source}|${p.title}`.slice(0, 120);
const toProduct = (p: ApiProduct): Product => ({
  id: productId(p), name: p.title, image: p.thumbnail ?? '', rating: p.rating ?? undefined, reviews: p.reviews ?? undefined,
  price: p.price ?? 0, currency: p.currency, provider: p.source, link: p.link,
});

/** Live price comparison. The backend returns listings from many retailers already sorted lowest price first. */
export async function searchProducts(q: string): Promise<Product[]> {
  const res = await apiGet<{ data: ApiProduct[] }>('/shopping/search', { q });
  return res.data.filter((p) => p.price !== null && p.price > 0).map(toProduct);
}
