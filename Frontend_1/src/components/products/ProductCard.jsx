import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import Rating from '../common/Rating';
import Badge from '../common/Badge';

const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

export default function ProductCard({ product, variant = 'default' }) {
  const { navigate } = useRouter(); const { isWishlisted, toggleWishlist } = useWishlist(); const { addItem } = useCart(); const [adding, setAdding] = useState(false); const [message, setMessage] = useState('');
  const handleAdd = async (event) => { event.stopPropagation(); setAdding(true); try { await addItem(product.id, 1, product.variants?.[0] || null); setMessage('Added'); setTimeout(() => setMessage(''), 1200); } catch (error) { setMessage(error.message); setTimeout(() => setMessage(''), 2200); } finally { setAdding(false); } };
  if (variant === 'listing') {
    const hasDiscount = product.mrp > product.price;
    return (
      <article
        onClick={() => navigate(`/product/${product.id}`)}
        className="group min-w-0 cursor-pointer bg-white transition-shadow duration-300 hover:shadow-[0_2px_18px_rgba(0,0,0,0.13)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img src={product.images[0]} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          {(product.new || product.trending) && (
            <div className="absolute left-2 top-2 flex gap-1.5">
              {product.new && <Badge tone="orange">New</Badge>}
              {product.trending && <Badge tone="gray">Trending</Badge>}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${isWishlisted(product.id) ? 'bg-white text-red-500' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
            aria-label="Toggle wishlist"
          >
            <Heart size={16} className={isWishlisted(product.id) ? 'fill-current' : ''} />
          </button>
          {product.rating > 0 && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-sm bg-white/95 px-1.5 py-0.5 text-xs font-semibold text-gray-800 shadow-sm transition-opacity duration-200 group-hover:opacity-0">
              {Number(product.rating).toFixed(1)}
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {product.reviewCount > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  {formatCount(product.reviewCount)}
                </>
              )}
            </span>
          )}
          <button
            onClick={handleAdd}
            disabled={product.stock < 1 || adding}
            className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-white/95 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-900 transition duration-300 group-hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? 'Adding...' : product.stock < 1 ? 'Out of stock' : <><ShoppingBag size={14} />{message || 'Add to cart'}</>}
          </button>
        </div>
        <div className="px-3 pb-3 pt-2.5">
          <p className="truncate text-[15px] font-bold text-gray-900">{product.brand}</p>
          <p className="mt-0.5 truncate text-sm text-gray-500">{product.title}</p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-sm">
            <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.mrp)}</span>}
            {product.discount > 0 && <span className="text-xs text-orange-600">({product.discount}% OFF)</span>}
          </p>
        </div>
      </article>
    );
  }
  return <article className="group min-w-0"><div className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-3xl bg-gray-100" onClick={() => navigate(`/product/${product.id}`)}><img src={product.images[0]} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"/><div className="absolute left-3 top-3 flex gap-2">{product.new && <Badge tone="orange">New</Badge>}{product.trending && <Badge tone="gray">Trending</Badge>}</div><button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${isWishlisted(product.id) ? 'bg-white text-red-500' : 'bg-white/80 text-gray-700 hover:bg-white'}`} aria-label="Toggle wishlist"><Heart size={18} className={isWishlisted(product.id) ? 'fill-current' : ''}/></button><button onClick={handleAdd} disabled={product.stock < 1 || adding} className="absolute bottom-3 left-3 right-3 flex translate-y-2 items-center justify-center gap-2 rounded-full bg-white/95 py-3 text-sm font-semibold opacity-0 shadow-sm backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60">{adding ? 'Adding...' : product.stock < 1 ? 'Out of stock' : <><ShoppingBag size={16}/>{message || 'Add to cart'}</>}</button></div><div className="px-1 pt-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gray-400">{product.brand}</p><button onClick={() => navigate(`/product/${product.id}`)} className="mt-1 text-left font-semibold leading-5 text-gray-900 hover:underline">{product.title}</button></div><Rating value={product.rating}/></div><div className="mt-2 flex items-center gap-2"><span className="font-bold">{formatCurrency(product.price)}</span><span className="text-xs text-gray-400 line-through">{formatCurrency(product.mrp)}</span><span className="text-xs font-semibold text-emerald-600">{product.discount}% off</span></div></div></article>;
}
