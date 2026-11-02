import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('shopease_token')));
  useEffect(() => {
    if (!localStorage.getItem('shopease_token')) return;
    authApi.me().then((res) => setUser(res.data)).catch(() => { localStorage.removeItem('shopease_token'); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (payload) => { const res = await authApi.login(payload); localStorage.setItem('shopease_token', res.data.token); setUser(res.data.user); return res.data.user; };
  const register = async (payload) => { const res = await authApi.register(payload); localStorage.setItem('shopease_token', res.data.token); setUser(res.data.user); return res.data.user; };
  const logout = () => { localStorage.removeItem('shopease_token'); setUser(null); };
  const updateProfile = async (payload) => { const res = await authApi.updateProfile(payload); setUser(res.data); return res.data; };
  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
