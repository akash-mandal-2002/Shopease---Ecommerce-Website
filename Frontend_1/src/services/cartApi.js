import { apiRequest } from './api';
export const cartApi = {
  get: () => apiRequest('/cart'),
  add: (payload) => apiRequest('/cart/items', { method: 'POST', body: JSON.stringify(payload) }),
  update: (productId, quantity) => apiRequest(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  remove: (productId) => apiRequest(`/cart/items/${productId}`, { method: 'DELETE' }),
};
