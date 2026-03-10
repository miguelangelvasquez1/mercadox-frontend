'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/lib/types/cart.types';
import {
  getCartFromStorage,
  saveCartToStorage,
  clearCartStorage,
} from '@/lib/cart/cartStorage';

interface AddToCartInput {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
  categoryName: string;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: AddToCartInput) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCartFromStorage());
  }, []);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = (product: AddToCartInput) => {
    const quantityToAdd = product.quantity ?? 1;

    setItems((current) => {
      const existing = current.find((item) => item.productId === product.productId);

      if (existing) {
        return current.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantityToAdd, item.stock),
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product.productId,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          stock: product.stock,
          quantity: Math.min(quantityToAdd, product.stock || quantityToAdd),
          categoryName: product.categoryName,
        },
      ];
    });
  };

  const removeItem = (productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const increaseQuantity = (productId: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
    );
  };

  const setQuantity = (productId: number, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.stock)),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    clearCartStorage();
  };

  const isInCart = (productId: number) => {
    return items.some((item) => item.productId === productId);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}