import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('b2bUser');
    return saved ? JSON.parse(saved) : null;
  });
  
  const isAuthenticated = !!currentUser;

  const login = (userData) => {
    localStorage.setItem('b2bUser', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('b2bUser');
    setCurrentUser(null);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const addToCart = (product, selectedQty = null) => {
    const qtyToAdd = selectedQty !== null ? selectedQty : product.moq;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [...prev, { ...product, quantity: qtyToAdd }];
    });
    triggerToast(`Added ${qtyToAdd} pieces of ${product.name} to cart`);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      toastMsg, showToast, triggerToast,
      isAuthenticated, currentUser, login, logout, setCurrentUser
    }}>
      {children}
    </CartContext.Provider>
  );
};
