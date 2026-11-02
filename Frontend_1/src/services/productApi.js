import { apiRequest } from './api';
export const productApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));
    return apiRequest(`/products?${query.toString()}`);
  },
  getById: (id) => apiRequest(`/products/${id}`),
  categories: () => apiRequest('/products/categories'),
};
