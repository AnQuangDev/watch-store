import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  loading: false,
  error: null
};

// Actions
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      const cart = action.payload;
      const totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cart.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: cart.products,
        totalQuantity,
        totalAmount,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      };
    default:
      return state;
  }
};

// CartProvider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { token } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [token]);

  // API call to fetch cart
  const fetchCart = async () => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const cart = await response.json();
        dispatch({ type: 'SET_CART', payload: cart });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to add items to cart' });
      return { success: false, error: 'Please login to add items to cart' };
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true, data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to add item to cart' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true, data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to update cart' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCart(); // Refresh cart
        return { success: true, data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to remove item from cart' });
        return { success: false, error: data.error };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        dispatch({ type: 'CLEAR_CART' });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
        return { success: false };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
      return { success: false };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearError,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
