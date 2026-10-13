import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('agritech_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('agritech_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.resourceId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.resourceId === product._id
            ? { ...item, qty: Math.min(product.stock, item.qty + qty) }
            : item
        );
      }
      return [
        ...prev,
        {
          resourceId: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          qty
        }
      ];
    });
  };

  const updateQty = (resourceId, qty) => {
    if (qty <= 0) {
      removeFromCart(resourceId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.resourceId === resourceId) {
          return { ...item, qty: Math.min(item.stock, qty) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (resourceId) => {
    setItems((prev) => prev.filter((item) => item.resourceId !== resourceId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
