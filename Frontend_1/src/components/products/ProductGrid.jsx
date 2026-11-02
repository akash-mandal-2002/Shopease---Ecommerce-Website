import ProductCard from './ProductCard';
import Loader from '../common/Loader';
import { EmptyState, ErrorState } from '../common/States';

// variant="listing" = Myntra-style listing page (denser grid, flat cards).
// Anything else (Wishlist, "You may also like") keeps the original grid + card.
export default function ProductGrid({ products, loading, error, onRetry, variant = 'default' }) {
  if (loading) return <Loader label="Loading products..." />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!products.length) return <EmptyState title="No products found" message="Try a different search or remove one of the filters." />;
  const grid =
    variant === 'listing'
      ? 'grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5'
      : 'grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6';
  return (
    <div className={grid}>
      {products.map((product) => <ProductCard key={product.id} product={product} variant={variant} />)}
    </div>
  );
}
