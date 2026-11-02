import { useEffect, useMemo, useState } from 'react';
import { X, Package } from 'lucide-react';
import { productApi } from '../services/productApi';
import { useRouter } from '../context/RouterContext';
import ProductFilters, { FilterSidebar, SortSelect } from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import { getGroup, pickGroupCategories, subcategoryPath } from '../utils/categoryGroups';

function getParams(search) {
  const params = new URLSearchParams(search);
  return {
    q: params.get('q') || '',
    category: params.get('category') || 'all',
  };
}

// `lockedCategory` / `backTo` are only passed from /category/:group/:slug pages;
// plain /shop behaves exactly as before.
export default function Shop({ lockedCategory = null, backTo = null, groupKey = null }) {
  const { search, pathname, navigate } = useRouter();
  const { q, category: queryCategory } = useMemo(() => getParams(search), [search]);
  const category = lockedCategory ?? queryCategory;

  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ products: [], pagination: { pages: 1, total: 0 } });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, category, brand, sort, priceRange, minRating]);

  // Load categories once
  useEffect(() => {
    let active = true;
    productApi.categories()
      .then((res) => { if (active) setCategories(res.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Load products
  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = {
      search: q,
      category,
      brand,
      sort,
      page,
      limit: 12,
    };

    // Pass price range to API if supported, otherwise we filter client-side
    if (priceRange) {
      params.minPrice = priceRange.min;
      if (priceRange.max !== Infinity) params.maxPrice = priceRange.max;
    }
    if (minRating) {
      params.minRating = minRating;
    }

    productApi.list(params)
      .then((res) => {
        if (!active) return;

        let products = res.data;
        let pagination = res.pagination;

        // Client-side price filtering (in case API doesn't support it)
        if (priceRange && products.length > 0) {
          const beforeFilter = products.length;
          products = products.filter((p) => {
            if (p.price < priceRange.min) return false;
            if (priceRange.max !== Infinity && p.price > priceRange.max) return false;
            return true;
          });
          // If we filtered some out client-side, update pagination count
          if (products.length !== beforeFilter) {
            pagination = { ...pagination, total: products.length, pages: 1 };
          }
        }

        // Client-side rating filtering (in case API doesn't support it)
        if (minRating && products.length > 0) {
          products = products.filter((p) => p.rating >= minRating);
          pagination = { ...pagination, total: products.length, pages: 1 };
        }

        setData({ products, pagination });
        setError('');
      })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [q, category, brand, sort, page, priceRange, minRating]);

  const prettySlug = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const heading = category === 'all'
    ? 'All products'
    : categories.find((item) => item.slug === category)?.name || prettySlug(category);

  const total = data.pagination.total || 0;
  const hasActiveFilters = brand !== 'all' || !!priceRange || !!minRating;

  // Breadcrumb: Home / <section> / <subcategory>
  const crumbs = [
    { label: 'Home', path: '/' },
    ...(backTo ? [backTo] : []),
    { label: heading },
  ];

  // Sibling subcategories shown in the sidebar (only on /category/:group/:slug)
  const group = groupKey ? getGroup(groupKey) : null;
  const siblingCategories = group
    ? pickGroupCategories(group, categories).map((c) => ({
        slug: c.slug,
        name: c.name,
        active: c.slug === category,
        onClick: () => navigate(subcategoryPath(groupKey, c.slug)),
      }))
    : [];

  const handleClearFilters = () => {
    setBrand('all');
    setSort('featured');
    setPriceRange(null);
    setMinRating(null);
    setPage(1);
    navigate(lockedCategory ? pathname : '/shop');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top of product grid
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-gray-300">/</span>}
            {crumb.path ? (
              <button type="button" onClick={() => navigate(crumb.path)} className="hover:text-gray-900 hover:underline">
                {crumb.label}
              </button>
            ) : (
              <span className="font-medium text-gray-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Title + sort */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
          {heading}
          <span className="ml-2 text-base font-normal tracking-normal text-gray-400">
            {loading ? '' : `– ${total} items`}
          </span>
        </h1>
        <div className="hidden lg:block">
          <SortSelect sort={sort} onSort={setSort} />
        </div>
      </div>

      {/* Mobile / tablet: sort + filters drawer */}
      <div className="mb-5 lg:hidden">
        <ProductFilters
          brand={brand}
          sort={sort}
          priceRange={priceRange}
          minRating={minRating}
          onBrand={(value) => setBrand(value)}
          onSort={(value) => setSort(value)}
          onPriceRange={setPriceRange}
          onMinRating={setMinRating}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Search query display */}
      {q && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <Package size={16} className="text-gray-400" />
          Search results for{' '}
          <strong className="text-gray-950">"{q}"</strong>
          <Button
            variant="ghost"
            className="ml-auto px-2 py-1"
            onClick={() => navigate(lockedCategory ? pathname : category === 'all' ? '/shop' : `/shop?category=${category}`)}
          >
            <X size={14} />
            Clear
          </Button>
        </div>
      )}

      {/* Sidebar + products */}
      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <FilterSidebar
            categories={siblingCategories}
            priceRange={priceRange}
            onPriceRange={setPriceRange}
            minRating={minRating}
            onMinRating={setMinRating}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        </aside>

        <div className="min-w-0">
          <ProductGrid
            variant="listing"
            products={data.products}
            loading={loading}
            error={error}
            onRetry={() => navigate(search || '/shop')}
          />

          {!loading && !error && data.pagination.pages > 1 && (
            <Pagination
              page={page}
              totalPages={data.pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </main>
  );
}
