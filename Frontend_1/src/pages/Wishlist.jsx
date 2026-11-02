import ProductGrid from '../components/products/ProductGrid';
import { useWishlist } from '../context/WishlistContext';
export default function Wishlist() { const { wishlist } = useWishlist(); return <main className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Saved for later</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Wishlist</h1><div className="mt-10"><ProductGrid products={wishlist} loading={false} error=""/></div></main>; }
