'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/lib/cart/CartContext';
import { AuthProvider } from '@/lib/auth/AuthContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}