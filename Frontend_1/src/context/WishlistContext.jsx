import { createContext, useContext, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
const WishlistContext = createContext(null);
export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => readStorage('shopease_wishlist', []));
  const toggleWishlist = (product) => setWishlist((current) => { const exists = current.some((item) => item.id === product.id); const next = exists ? current.filter((item) => item.id !== product.id) : [...current, product]; writeStorage('shopease_wishlist', next); return next; });
  const value = useMemo(() => ({ wishlist, toggleWishlist, isWishlisted: (id) => wishlist.some((item) => item.id === id) }), [wishlist]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
