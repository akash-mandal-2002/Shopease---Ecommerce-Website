
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { productApi } from '../../services/productApi';
import { useRouter } from '../../context/RouterContext';

const MENS_SHOES_QUERY = {
  category: 'mens-shoes',
  sort: 'featured',
  limit: 10,
};

const PRODUCT_COUNT = 10;

const getId = (product) => product.id ?? product._id;

const getName = (product) => product.name || product.title || '';

const getImage = (product) =>
  product.image || product.thumbnail || product.images?.[0] || '';

const getPath = (product) =>
  `/product/${product.slug || getId(product)}`;

const getRating = (product) =>
  Number(product.rating ?? product.averageRating ?? 0);

const getReviewCount = (product) =>
  Number(
    product.reviewCount ??
      product.numReviews ??
      (typeof product.reviews === 'number' ? product.reviews : 0)
  );

const getOriginalPrice = (product) =>
  product.originalPrice ??
  product.compareAtPrice ??
  product.mrp ??
  null;

// Normalize category values from different possible API formats.
const normalizeCategory = (value) => {
  if (value == null) return '';

  if (typeof value === 'object') {
    return normalizeCategory(
      value.slug || value.name || value.title || ''
    );
  }

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-');
};

const MENS_SHOE_CATEGORIES = new Set([
  'mens-shoes',
  'men-shoes',
  'mens-shoe',
  'men-shoe',
]);

const isMensShoes = (product) => {
  const categories = [
    product.category,
    product.categorySlug,
    product.categoryName,
    product.categoryId,
    ...(Array.isArray(product.categories) ? product.categories : []),
  ];

  return categories.some((category) =>
    MENS_SHOE_CATEGORIES.has(normalizeCategory(category))
  );
};

// Handle common API response formats.
const getProductList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const formatAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return '';

  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const compactCount = (value) =>
  value >= 1000
    ? new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
      })
        .format(value)
        .toLowerCase()
    : String(value);

const CARD_W =
  'w-[calc((100%-1.5rem)/2.3)] sm:w-[calc((100%-3.75rem)/3.2)] md:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-5rem)/5)]';

/* ----------------------------- Star rating ----------------------------- */

function StarRating({ value }) {
  const rating = Math.max(0, Math.min(5, value));
  const percentage = rating * 20;

  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <span className="flex text-gray-300">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={13}
            strokeWidth={0}
            fill="currentColor"
          />
        ))}
      </span>

      <span
        className="absolute inset-y-0 left-0 overflow-hidden text-blue-700"
        style={{ width: `${percentage}%` }}
      >
        <span className="flex w-max">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={13}
              strokeWidth={0}
              fill="currentColor"
              className="shrink-0"
            />
          ))}
        </span>
      </span>
    </span>
  );
}

/* ----------------------------- Product card ---------------------------- */

function ProductCard({
  product,
  wished,
  onToggleWish,
  onOpen,
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const name = getName(product);
  const image = getImage(product);
  const rating = getRating(product);
  const reviews = getReviewCount(product);
  const original = getOriginalPrice(product);
  const hasDiscount =
    original != null &&
    Number(original) > Number(product.price);

  const currency = product.currency || 'INR';

  return (
    <article className={`group relative ${CARD_W} shrink-0 snap-start`}>
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left outline-none"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 ring-2 ring-inset ring-transparent transition-shadow duration-200 group-has-[button:focus-visible]:ring-black">
          {image && !imgFailed ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image available
            </div>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-sm leading-snug text-gray-900 group-hover:underline">
          {name}
        </h3>

        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating value={rating} />

            {reviews > 0 && (
              <span className="text-xs text-gray-500">
                ({compactCount(reviews)})
              </span>
            )}
          </div>
        )}

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-bold text-gray-950">
            {formatAmount(product.price)}
            <span className="ml-1 text-[10px] font-semibold text-gray-600">
              {currency}
            </span>
          </span>

          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through">
              <span className="sr-only">Was </span>
              {formatAmount(original)}
            </span>
          )}
        </div>
      </button>

      {/* Wishlist button stays separate to avoid nested buttons. */}
      <button
        type="button"
        aria-label={
          wished
            ? `Remove ${name} from wishlist`
            : `Add ${name} to wishlist`
        }
        aria-pressed={wished}
        onClick={onToggleWish}
        className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
          wished
            ? 'text-red-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}

/* ----------------------------- Skeleton card --------------------------- */

function SkeletonCard() {
  return (
    <div className={`${CARD_W} shrink-0`}>
      <div className="skeleton aspect-square w-full rounded-xl" />
      <div className="skeleton mt-3 h-4 w-11/12" />
      <div className="skeleton mt-1.5 h-4 w-2/3" />
      <div className="skeleton mt-2.5 h-3.5 w-1/2" />
      <div className="skeleton mt-2.5 h-4 w-1/3" />
    </div>
  );
}

/* ----------------------------- Main section ---------------------------- */

export default function MensShoes({
  title = "Men's Shoes",
  query = MENS_SHOES_QUERY,
}) {
  const { navigate } = useRouter();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [wishlist, setWishlist] = useState(() => new Set());
  const [edge, setEdge] = useState({
    start: true,
    end: false,
  });

  const scrollRef = useRef(null);

  /* ----------------------------- Fetch products ------------------------ */

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await productApi.list(query);

        if (!active) return;

        const list = getProductList(response);

        // Display only products belonging to the men's shoes category.
        const filteredProducts = list
          .filter(isMensShoes)
          .slice(0, PRODUCT_COUNT);

        setProducts(filteredProducts);
      } catch (err) {
        if (active) {
          setError(
            err?.message || "Couldn't load men's shoes."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [query, attempt]);

  /* ----------------------------- Carousel controls --------------------- */

  const updateEdges = useCallback(() => {
    const element = scrollRef.current;

    if (!element) return;

    setEdge({
      start: element.scrollLeft <= 4,
      end:
        element.scrollLeft + element.clientWidth >=
        element.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return undefined;

    updateEdges();

    element.addEventListener('scroll', updateEdges, {
      passive: true,
    });

    window.addEventListener('resize', updateEdges);

    return () => {
      element.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [products, loading, updateEdges]);

  const scrollByPage = (direction) => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollBy({
      left: direction * element.clientWidth * 0.85,
      behavior: 'smooth',
    });
  };

  /* ----------------------------- Wishlist ------------------------------ */

  const toggleWish = (id) => {
    setWishlist((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const arrowClass =
    'hidden h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 transition-colors duration-200 hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 md:flex';

  /* ----------------------------- Render section ------------------------ */

  return (
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
       <h2 style={{fontFamily: "Satoshi-Medium"}} className="text-lg tracking-tight text-gray-800 sm:text-2xl">
          {title}
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Previous men's shoes"
            disabled={edge.start || loading || products.length === 0}
            onClick={() => scrollByPage(-1)}
            className={arrowClass}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Next men's shoes"
            disabled={edge.end || loading || products.length === 0}
            onClick={() => scrollByPage(1)}
            className={arrowClass}
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/shop?category=mens-shoes')
            }
            className="ml-1 inline-flex items-center gap-0.5 rounded text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            View all
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Product carousel */}
      <div className="mt-5 sm:mt-6">
        {loading ? (
          <div className="flex gap-3 overflow-hidden sm:gap-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 px-6 py-8">
            <p className="text-sm text-gray-700">
              We couldn't load men's shoes. {error}
            </p>

            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="rounded-full border border-gray-900 px-5 py-2 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:bg-black hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-10">
            <p className="text-sm text-gray-500">
              No men's shoes available right now.
            </p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="-mx-4 flex snap-x snap-proximity gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => {
              const id = getId(product);

              return (
                <ProductCard
                  key={id}
                  product={product}
                  wished={wishlist.has(id)}
                  onToggleWish={() => toggleWish(id)}
                  onOpen={() => navigate(getPath(product))}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
