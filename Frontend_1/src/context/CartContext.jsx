import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';
const CartContext = createContext(null);
const emptyCart = { items: [], totalPrice: 0 };
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => { if (!user) { setCart(emptyCart); return; } setLoading(true); try { setCart((await cartApi.get()).data); setError(''); } catch (err) { setError(err.message); } finally { setLoading(false); } }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const addItem = async (productId, quantity = 1, variant = null) => { if (!user) throw new Error('Please sign in before adding items to your cart.'); const res = await cartApi.add({ productId, quantity, variant }); setCart(res.data); return res.data; };
  const updateItem = async (id, quantity) => { const res = await cartApi.update(id, quantity); setCart(res.data); };
  const removeItem = async (id) => { const res = await cartApi.remove(id); setCart(res.data); };
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ cart, loading, error, refresh, addItem, updateItem, removeItem, count }), [cart, loading, error, refresh, count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
