import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, getAuthHeader } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get or create session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // Load cart from backend
  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      // If not authenticated, include session ID
      const sessionId = !isAuthenticated() ? getSessionId() : null;
      const url = sessionId 
        ? `${API_URL}/api/cart?sessionId=${sessionId}`
        : `${API_URL}/api/cart`;

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        setCartId(data.cartId);
      } else {
        // Cart doesn't exist yet - that's okay
        setCartItems([]);
        setCartId(null);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addProduct = async (productId, quantity = 1) => {
    try {
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      const body = {
        productId,
        quantity,
        sessionId: !isAuthenticated() ? getSessionId() : null
      };

      const response = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        setCartId(data.cartId);
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Add custom cigar to cart
  const addCustomCigar = async (customization) => {
    try {
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      const body = {
        isCustom: true,
        customization,
        quantity: customization.quantity || 1,
        sessionId: !isAuthenticated() ? getSessionId() : null
      };

      const response = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        setCartId(data.cartId);
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding custom cigar to cart:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update cart item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        return { success: true };
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items);
        return { success: true };
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setCartItems([]);
        setCartId(null);
        return { success: true };
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Calculate cart totals
  const getCartSummary = () => {
    const itemCount = cartItems.length;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
    
    return {
      itemCount,
      totalQuantity,
      subtotal,
      tax: subtotal * 0.08, // 8% tax
      total: subtotal * 1.08
    };
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.product_id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    cartId,
    loading,
    error,
    addProduct,
    addCustomCigar,
    updateQuantity,
    removeItem,
    clearCart,
    loadCart,
    getCartSummary,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
