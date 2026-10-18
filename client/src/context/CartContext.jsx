import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'theeventstore_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) {
      return { success: false, message: 'This item is currently out of stock.' };
    }

    let addedQty = quantity;
    let message = '';

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.productId === product._id);

      if (existingIdx > -1) {
        const existing = prevItems[existingIdx];
        const newQty = existing.quantity + quantity;

        if (newQty > product.stock) {
          const allowed = product.stock - existing.quantity;
          if (allowed <= 0) {
            message = `You already have all ${product.stock} available units of '${product.name}' in your cart.`;
            return prevItems;
          }
          message = `Only ${product.stock} units available. Added ${allowed} more to reach max stock.`;
          const updated = [...prevItems];
          updated[existingIdx] = { ...existing, quantity: product.stock, stock: product.stock };
          return updated;
        }

        const updated = [...prevItems];
        updated[existingIdx] = { ...existing, quantity: newQty, stock: product.stock };
        message = `Updated '${product.name}' quantity to ${newQty}.`;
        return updated;
      }

      // New item
      if (quantity > product.stock) {
        addedQty = product.stock;
        message = `Only ${product.stock} units available. Added ${addedQty} to cart.`;
      } else {
        message = `Added ${addedQty}x '${product.name}' to cart.`;
      }

      return [
        ...prevItems,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.images?.[0] || '',
          quantity: addedQty,
        },
      ];
    });

    setIsCartOpen(true);
    return { success: true, message: message || 'Item added to cart.' };
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          const maxAllowed = item.stock ? Math.min(quantity, item.stock) : quantity;
          return { ...item, quantity: maxAllowed };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Live stock re-validation with server
  const validateCartWithServer = async () => {
    if (items.length === 0) return { valid: true, items: [] };

    try {
      const payload = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
      }));

      const res = await api.post('/public/cart/validate', { items: payload });
      const { valid, items: serverValidated } = res.data;

      // Automatically sync updated stock and adjusted quantities in local cart
      if (!valid && serverValidated) {
        setItems((prev) => {
          return prev
            .map((localItem) => {
              const serverItem = serverValidated.find((sv) => sv.productId === localItem.productId);
              if (!serverItem || !serverItem.isAvailable) {
                return null; // out of stock or removed
              }
              return {
                ...localItem,
                stock: serverItem.availableStock,
                quantity: Math.min(localItem.quantity, serverItem.availableStock),
                price: serverItem.currentPrice || localItem.price,
              };
            })
            .filter(Boolean);
        });
      }

      setLastValidation(res.data);
      return res.data;
    } catch (error) {
      console.error('Cart validation error', error);
      return { valid: false, error: error.message };
    }
  };

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const value = {
    items,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    validateCartWithServer,
    lastValidation,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
