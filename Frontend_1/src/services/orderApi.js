import { apiRequest } from './api';
export const orderApi = {
  create: (payload) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  mine: () => apiRequest('/orders/mine'),
};
