import React from "react";

const { createContext, useContext, useState, useMemo, useEffect } = React;

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function addItem(product) {
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

  function incrementItem(productId) {
    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }

  function decrementItem(productId) {
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

  return React.createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  return useContext(CartContext);
}
