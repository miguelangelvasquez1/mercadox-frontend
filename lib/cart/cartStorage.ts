import type { CartItem } from '@/lib/types/cart.types';

const CART_KEY = 'mercadox_cart';

export function getCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCartStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}