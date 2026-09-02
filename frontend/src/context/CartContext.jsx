import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ecom_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const pId = String(product.id || product.productId);
      const existing = prev.find((item) => String(item.id || item.productId) === pId);
      if (existing) {
        showToast(`Updated "${product.name}" quantity (${existing.quantity + quantity})`, 'success');
        return prev.map((item) =>
          String(item.id || item.productId) === pId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      showToast(`Added "${product.name}" to cart! 🛍️`, 'success');
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const pId = String(productId);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (String(item.id || item.productId) === pId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId) => {
    const pId = String(productId);
    const item = cart.find((i) => String(i.id || i.productId) === pId);
    if (item) {
      showToast(`Removed "${item.name}" from cart`, 'info');
    }
    setCart((prev) => prev.filter((item) => String(item.id || item.productId) !== pId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setDiscountAmount(0);
  };

  const applyPromoCode = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      showToast('Please enter a coupon code', 'warning');
      return false;
    }

    if (clean === 'NEXUS10' || clean === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedPromo({ code: clean, discountPercent: 10 });
      showToast(`Coupon "${clean}" applied! 10% discount added.`, 'success');
      return true;
    } else if (clean === 'FESTIVE20' || clean === 'SAVE20') {
      const discount = Math.round(subtotal * 0.2);
      setDiscountAmount(discount);
      setAppliedPromo({ code: clean, discountPercent: 20 });
      showToast(`Coupon "${clean}" applied! 20% discount added.`, 'success');
      return true;
    } else {
      showToast('Invalid coupon code. Try "NEXUS10" or "SAVE20"', 'error');
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    showToast('Coupon removed', 'info');
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const isFreeShipping = true; // All orders include Free Delivery
  const shippingFee = 0;
  const amountNeededForFreeShipping = 0;
  const freeShippingProgress = 100;
  const estimatedTax = Math.round(((subtotal - discountAmount) * 18) / 118); // GST included in price
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItems,
        isFreeShipping,
        shippingFee,
        amountNeededForFreeShipping,
        freeShippingProgress,
        discountAmount,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        estimatedTax,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
