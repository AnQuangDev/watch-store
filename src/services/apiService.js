const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'An error occurred' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

// Auth API
export const authAPI = {
  register: (userData) => makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getMe: (token) => makeRequest('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => makeRequest(`/products/${id}`),

  create: (productData, token) => makeRequest('/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  }),

  update: (id, productData, token) => makeRequest(`/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  }),

  delete: (id, token) => makeRequest(`/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),
};

// Cart API
export const cartAPI = {
  get: (token) => makeRequest('/cart', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  add: (productId, quantity, token) => makeRequest('/cart/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  }),

  update: (productId, quantity, token) => makeRequest('/cart/update', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  }),

  remove: (productId, token) => makeRequest(`/cart/remove/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  clear: (token) => makeRequest('/cart/clear', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),
};

// Orders API
export const ordersAPI = {
  create: (orderData, token) => makeRequest('/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  }),

  getUserOrders: (token) => makeRequest('/orders', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  getById: (orderId, token) => makeRequest(`/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  getAllOrders: (token) => makeRequest('/orders/admin/all', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }),

  updateStatus: (orderId, status, token) => makeRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  }),
};

// Health check
export const healthCheck = () => makeRequest('/health');
