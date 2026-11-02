import { apiRequest } from './api';
export const authApi = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest('/auth/me'),
  updateProfile: (payload) => apiRequest('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
};
