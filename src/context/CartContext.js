import React from "https://esm.sh/react@18";

const { createContext, useContext, useState, useMemo } = React;

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(product) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { productId: product.id, price: product.price, quantity: 1 }];
    });
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
    () => ({ items, addItem, incrementItem, decrementItem, clearCart, totalCount, totalPrice }),
    [items]
  );

  return React.createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  return useContext(CartContext);
}
