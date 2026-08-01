import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartCustom = {
  type: string;
  color: string;
  pattern: string | null;
  text: string;
};

export type CartItem = {
  productId: string;
  price: number;
  quantity: number;
  name: string;
  custom?: CartCustom;
};

type AddableProduct = {
  id: string;
  name: string;
  price: number;
  custom?: CartCustom;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: AddableProduct) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  toast: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function addItem(product: AddableProduct) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...current,
        { productId: product.id, price: product.price, quantity: 1, name: product.name, custom: product.custom },
      ];
    });
    setToast(`${product.name} sepete eklendi`);
  }

  function incrementItem(productId: string) {
    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }

  function decrementItem(productId: string) {
    setItems((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({ items, addItem, incrementItem, decrementItem, clearCart, totalCount, totalPrice, toast }),
    [items, toast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
