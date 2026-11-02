import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { productApi } from '../../services/productApi';
import { useRouter } from '../../context/RouterContext';

// Icon mappings for categories that don't have great images
const categoryIcons = {
  beauty: '💄',
  fragrances: '🌸',
  furniture: '🛋️',
  groceries: '🛒',
  'home-decoration': '🏠',
  'kitchen-accessories': '🍳',
  laptops: '💻',
  'mens-shirts': '👔',
  'mens-shoes': '👟',
  'mens-watches': '⌚',
  'mobile-accessories': '📱',
  motorcycle: '🏍️',
  'skin-care': '✨',
  smartphones: '📲',
  'sports-accessories': '⚽',
  sunglasses: '🕶️',
  tablets: '📋',
  tops: '👗',
  vehicle: '🚗',
  'womens-bags': '👜',
  'womens-dresses': '👠',
  'womens-jewellery': '💎',
  'womens-shoes': '👢',
  'womens-watches': '⏱️',
};

// Shared sizing so skeleton, items and arrows always line up
const ITEM_W = 'w-[76px] sm:w-[96px] lg:w-[112px]';

export function CategoryCircle({ category, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const fallback = categoryIcons[category.slug] || '📦';

  return (
    <button
      type="button"
      onClick={onClick}
      title={category.description || category.name}
      className={`group flex ${ITEM_W} shrink-0 snap-start flex-col items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4`}
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-black/5 transition-all duration-300 group-hover:bg-gray-50 group-hover:shadow-md group-hover:ring-orange-200">
        {category.image && !imgFailed ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full p-2 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl">
            {fallback}
          </span>
        )}
      </span>
      <span className="line-clamp-2 w-full text-center text-[11px] font-medium leading-tight text-gray-800 transition-colors duration-200 group-hover:text-orange-600 sm:text-[13px]">
        {category.name}
      </span>
    </button>
  );
}

export default function CategorySection() {
  const { navigate } = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    productApi.categories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Show first 12 on the home page for a clean look
  const displayCategories = categories.slice(0, 12);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, displayCategories.length, loading]);

  const scrollByPage = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-4 w-14" />
        </div>
        <div className="mt-5 flex gap-4 overflow-hidden sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${ITEM_W} shrink-0`}>
              <div className="skeleton aspect-square w-full rounded-full" />
              <div className="skeleton mx-auto mt-2.5 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const arrowBtn =
    'absolute top-[38px] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md outline-none transition-all duration-200 hover:bg-gray-50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-orange-500 sm:top-[48px] sm:flex lg:top-[56px]';

  return (
    <section className="mx-auto max-w-[1500px] px-8">
      {/* Header */}
      <div className="flex items-center  justify-between gap-4">
        <h2 style={{fontFamily: "Satoshi-Medium"}} className="text-lg tracking-tight text-gray-800 sm:text-2xl">
          Explore popular categories
        </h2>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="text-xs font-semibold text-orange-600 transition-colors duration-200 hover:text-orange-700 hover:underline sm:text-sm"
        >
          View all
        </button>
      </div>

      {/* Category row */}
      <div className="relative mt-5">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollByPage(-1)}
            className={`${arrowBtn} -left-2 lg:-left-4`}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="-mx-1 flex snap-x snap-proximity gap-4 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
        >
          {displayCategories.map((category) => (
            <CategoryCircle
              key={category.id}
              category={category}
              onClick={() => navigate(`/shop?category=${category.slug}`)}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollByPage(1)}
            className={`${arrowBtn} -right-2 lg:-right-4`}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}