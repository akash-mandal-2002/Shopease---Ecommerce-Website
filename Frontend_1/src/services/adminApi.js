import { apiRequest } from './api';
export const adminApi = {
  orders: () => apiRequest('/orders'),
  updateOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createProduct: (payload) => apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  createCategory: (payload) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};
