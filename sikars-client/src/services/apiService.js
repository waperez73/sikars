/**
 * API Service for Sikars Frontend
 * Centralized API communication layer
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Extract error message from response
    const error = {
      status: response.status,
      message: data.message || 'An error occurred',
      errors: data.errors || []
    };
    throw error;
  }
  
  return data;
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers
const createHeaders = (includeAuth = false, customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null
      })
    });
    
    return handleResponse(response);
  },

  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    const data = await handleResponse(response);
    
    // Store token and user info
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Verify token validity
  verifyToken: async () => {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  }
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
  // Get all cigar sizes
  getSizes: async () => {
    const response = await fetch(`${API_URL}/api/products/sizes`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleResponse(response);
  },

  // Get all binders
  getBinders: async () => {
    const response = await fetch(`${API_URL}/api/products/binders`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleResponse(response);
  },

  // Get all flavors
  getFlavors: async () => {
    const response = await fetch(`${API_URL}/api/products/flavors`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleResponse(response);
  },

  // Get all band styles
  getBandStyles: async () => {
    const response = await fetch(`${API_URL}/api/products/band-styles`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleResponse(response);
  },

  // Get all box types
  getBoxTypes: async () => {
    const response = await fetch(`${API_URL}/api/products/box-types`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleResponse(response);
  },

  // Get all products at once
  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/api/products/all`, {
      method: 'GET',
      headers: createHeaders()
    });
    
    return handleResponse(response);
  }
};

// ============================================
// ORDERS API
// ============================================

export const ordersAPI = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(orderData)
    });
    
    return handleResponse(response);
  },

  // Get user's orders
  getOrders: async () => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  },

  // Get specific order
  getOrder: async (orderId) => {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  },

  // Get order tracking
  getTracking: async (orderId) => {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/tracking`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  }
};

// ============================================
// PAYMENT API
// ============================================

export const paymentAPI = {
  // Process payment
  processPayment: async (paymentData) => {
    const response = await fetch(`${API_URL}/api/payments/process`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(paymentData)
    });
    
    return handleResponse(response);
  },

  // Get payment details
  getPayment: async (paymentId) => {
    const response = await fetch(`${API_URL}/api/payments/${paymentId}`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  }
};

// ============================================
// PREVIEW API
// ============================================

export const previewAPI = {
  // Generate preview image
  generatePreview: async (customizationData) => {
    const response = await fetch(`${API_URL}/api/preview/generate`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(customizationData)
    });
    
    return handleResponse(response);
  }
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(userData)
    });
    
    return handleResponse(response);
  },

  // Get user addresses
  getAddresses: async () => {
    const response = await fetch(`${API_URL}/api/users/addresses`, {
      method: 'GET',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  },

  // Add address
  addAddress: async (addressData) => {
    const response = await fetch(`${API_URL}/api/users/addresses`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(addressData)
    });
    
    return handleResponse(response);
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await fetch(`${API_URL}/api/users/addresses/${addressId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(addressData)
    });
    
    return handleResponse(response);
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await fetch(`${API_URL}/api/users/addresses/${addressId}`, {
      method: 'DELETE',
      headers: createHeaders(true)
    });
    
    return handleResponse(response);
  }
};

// Export all APIs
export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  payment: paymentAPI,
  preview: previewAPI,
  user: userAPI
};
