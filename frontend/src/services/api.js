import axios from 'axios';

const API_URL = 'http://localhost:5237/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProducts = (categoryId, search) => {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;
  return api.get('/products', { params });
};

export const getCategories = () => api.get('/categories');

export const loginUser = (email, password) => api.post('/users/login', { email, password });
export const registerUser = (data) => api.post('/users/register', data);

export const getCart = (sessionId) => api.get(`/carts/${sessionId}`);
export const addToCart = (sessionId, productId, quantity = 1, variantId = null) => api.post(`/carts/${sessionId}/items`, { productId, quantity, variantId });
export const updateCartItem = (sessionId, itemId, quantity) => api.put(`/carts/${sessionId}/items/${itemId}`, { quantity });
export const removeFromCart = (sessionId, itemId) => api.delete(`/carts/${sessionId}/items/${itemId}`);

export const createOrder = (data) => api.post('/orders', data);
export const getUserOrders = (userId) => api.get(`/orders?userId=${userId}`);
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}`, { status: 'Canceled' });


export default api;
