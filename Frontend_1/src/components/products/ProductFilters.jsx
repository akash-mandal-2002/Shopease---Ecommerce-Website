import { SlidersHorizontal, X, ChevronDown, Star, RotateCcw, Check } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
  { label: '₹15,000 – ₹50,000', min: 15000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: Infinity },
];

const RATING_OPTIONS = [
  { label: '4★ & above', value: 4 },
  { label: '3★ & above', value: 3 },
  { label: '2★ & above', value: 2 },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

function FilterSelect({ label, value, onChange, options, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-gray-700 outline-none transition-all duration-200 hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function ProductFilters({
  brand,
  sort,
  priceRange,
  minRating,
  onBrand,
  onSort,
  onPriceRange,
  onMinRating,
  onClearFilters,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract unique brands from categories isn't possible, so we use the prop
  const sortOptions = SORT_OPTIONS;

  const hasActiveFilters = brand !== 'all' || sort !== 'featured' || priceRange || minRating;
  const activeFilterCount = [
    brand !== 'all',
    sort !== 'featured',
    !!priceRange,
    !!minRating,
  ].filter(Boolean).length;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      {/* Mobile filter trigger */}
      <div className="flex items-center gap-2 lg:hidden">
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={onSort}
          options={sortOptions}
          className="flex-1"
        />
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Drawer/Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="animate-slide-in-right absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Price Range */}
              <div className="mb-7">
                <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
                <div className="mt-3 grid gap-2">
                  {PRICE_RANGES.map((range) => {
                    const isActive = priceRange && priceRange.min === range.min && priceRange.max === range.max;
                    return (
                      <button
                        key={range.label}
                        onClick={() => onPriceRange && onPriceRange(isActive ? null : { min: range.min, max: range.max })}
                        className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-7">
                <h3 className="text-sm font-semibold text-gray-900">Minimum Rating</h3>
                <div className="mt-3 grid gap-2">
                  {RATING_OPTIONS.map((opt) => {
                    const isActive = minRating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onMinRating && onMinRating(isActive ? null : opt.value)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < opt.value
                                ? (isActive ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400')
                                : (isActive ? 'text-white/30' : 'text-gray-200')
                              }
                            />
                          ))}
                        </div>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-7">
                <h3 className="text-sm font-semibold text-gray-900">Sort by</h3>
                <div className="mt-3 grid gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onSort(opt.value)}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                        sort === opt.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
              {hasActiveFilters && onClearFilters && (
                <button
                  onClick={() => {
                    onClearFilters();
                    setDrawerOpen(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                >
                  <RotateCcw size={14} />
                  Clear all
                </button>
              )}
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex flex-1 items-center justify-center rounded-xl bg-gray-950 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* -------------------------------------------------------------------------- */
/*  Desktop listing pieces (Myntra-style): sort box + left filter sidebar      */
/* -------------------------------------------------------------------------- */

export function SortSelect({ sort, onSort }) {
  return (
    <label className="relative flex items-center gap-1.5 rounded-md border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-500">
      Sort by :
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent font-semibold text-gray-900 outline-none"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </label>
  );
}

function Checkbox({ checked }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
        checked ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300 bg-white group-hover:border-gray-500'
      }`}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </span>
  );
}

function SidebarOption({ checked, onClick, children }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className="group flex w-full items-center gap-3 py-1.5 text-left text-sm text-gray-700 transition-colors hover:text-gray-950"
    >
      <Checkbox checked={checked} />
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

function SidebarSection({ title, children }) {
  return (
    <section className="border-t border-gray-200 py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-900">{title}</h3>
      {children}
    </section>
  );
}

/**
 * `categories` = [{ slug, name, active, onClick }] - sibling subcategories of the
 * current section (only passed on /category/:group/:slug pages).
 */
export function FilterSidebar({
  categories = [],
  priceRange,
  onPriceRange,
  minRating,
  onMinRating,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-3 [scrollbar-width:thin]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-900">Filters</h2>
        {hasActiveFilters && onClearFilters && (
          <button type="button" onClick={onClearFilters} className="text-xs font-semibold text-orange-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <SidebarSection title="Categories">
          {categories.map((c) => (
            <SidebarOption key={c.slug} checked={c.active} onClick={c.onClick}>
              {c.name}
            </SidebarOption>
          ))}
        </SidebarSection>
      )}

      <SidebarSection title="Price">
        {PRICE_RANGES.map((range) => {
          const active = !!priceRange && priceRange.min === range.min && priceRange.max === range.max;
          return (
            <SidebarOption
              key={range.label}
              checked={active}
              onClick={() => onPriceRange(active ? null : { min: range.min, max: range.max })}
            >
              {range.label}
            </SidebarOption>
          );
        })}
      </SidebarSection>

      <SidebarSection title="Customer rating">
        {RATING_OPTIONS.map((opt) => {
          const active = minRating === opt.value;
          return (
            <SidebarOption key={opt.value} checked={active} onClick={() => onMinRating(active ? null : opt.value)}>
              {opt.label}
            </SidebarOption>
          );
        })}
      </SidebarSection>
    </div>
  );
}
