import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Clock, Search, X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

const RECENT_KEY = "shopease:recent-searches";
const MAX_RECENT = 5;
const SUGGEST_LIMIT = 6;
const DEBOUNCE_MS = 250;
const CLOSE_MS = 300; // keep in sync with the duration-300 classes below

const TRENDING = [
  "Denim",
  "Laptops",
  "Skincare",
  "Fragrances",
  "Fresh groceries",
  "Shirts",
];

// Swap this for your own API call if you aren't using DummyJSON.
const SUGGEST_URL = (q) =>
  `https://dummyjson.com/products/search?q=${encodeURIComponent(
    q
  )}&limit=${SUGGEST_LIMIT}&select=id,title,price,thumbnail,category`;

/* -------------------------------------------------------------------------- */
/*  Recent searches (localStorage, always guarded)                             */
/* -------------------------------------------------------------------------- */

const readRecent = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(raw) ? raw.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};

const writeRecent = (list) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable – ignore */
  }
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Right-side sliding search panel.
 *
 * Props
 *  - open     boolean  – controlled visibility
 *  - onClose  () => void
 *  - onSearch (term: string) => void – called with a trimmed term (may be "")
 */
export default function SearchPanel({ open, onClose, onSearch }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(readRecent);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const term = query.trim();
  const isTyping = term.length > 0;

  /* ---- Open / close side effects: focus, scroll lock, Esc, focus trap ---- */
  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;

    // Lock page scroll without the layout shifting when the scrollbar vanishes.
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    // Auto-focus once the panel has started to become visible.
    const focusTimer = setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      50
    );

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  /* ---- Reset the field once the closing animation has finished ----------- */
  useEffect(() => {
    if (open) {
      setRecent(readRecent());
      return undefined;
    }

    const timer = setTimeout(() => {
      setQuery("");
      setResults([]);
      setLoading(false);
    }, CLOSE_MS);

    return () => clearTimeout(timer);
  }, [open]);

  /* ---- Live suggestions (debounced, cancellable) -------------------------- */
  useEffect(() => {
    if (!open || term.length < 2) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(SUGGEST_URL(term), {
          signal: controller.signal,
        });
        const data = await res.json();

        setResults(Array.isArray(data.products) ? data.products : []);
        setLoading(false);
      } catch (error) {
        if (error.name === "AbortError") return;
        setResults([]);
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, open]);

  /* ---- Actions ------------------------------------------------------------ */
  const commit = (value) => {
    const next = value.trim();

    if (next) {
      const list = [
        next,
        ...recent.filter((item) => item.toLowerCase() !== next.toLowerCase()),
      ].slice(0, MAX_RECENT);

      setRecent(list);
      writeRecent(list);
    }

    onSearch(next);
  };

  const clearRecent = () => {
    setRecent([]);
    writeRecent([]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    commit(query);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] transition-[visibility] duration-300 ${
        open ? "visible" : "invisible"
      }`}
      aria-hidden={!open}
    >
      {/* Local keyframes for the soft fade-up of list content */}
      <style>{`
        @keyframes sp-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp-fade-up { animation: sp-fade-up .35s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .sp-fade-up { animation: none; }
        }
      `}</style>

      {/* Dim overlay – click anywhere on it to close */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:w-[440px] lg:w-[480px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close */}
        <div className="flex justify-end px-5 pt-5 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <X
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* Search field */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="px-5 pt-5 sm:px-8"
        >
          <label className="relative block">
            <span className="sr-only">Search products</span>

            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search"
              className="h-12 w-full rounded-full border-2 border-neutral-200 bg-white pl-11 pr-11 text-base text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 sm:text-[15px]"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </form>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-10 pt-8 sm:px-8">
          {!isTyping ? (
            /* ----------------------------- Empty state ---------------------------- */
            <div key="empty" className="sp-fade-up">
              <h2 className="text-[26px] font-medium leading-tight tracking-tight text-neutral-900">
                What are you looking for?
              </h2>
              <p className="mt-1.5 text-sm text-neutral-500">
                Search products, brands and categories.
              </p>

              {recent.length > 0 && (
                <section className="mt-9">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[19px] font-medium text-neutral-900">
                      Recent
                    </h3>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-[13px] text-neutral-600 underline underline-offset-4 transition hover:text-black"
                    >
                      Clear all
                    </button>
                  </div>

                  <ul className="mt-3">
                    {recent.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => commit(item)}
                          className="group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] text-neutral-800 transition hover:bg-neutral-50 hover:text-black"
                        >
                          <Clock
                            size={15}
                            className="shrink-0 text-neutral-400"
                          />
                          <span className="flex-1 truncate">{item}</span>
                          <ArrowUpRight
                            size={15}
                            className="shrink-0 -translate-x-1 text-neutral-400 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mt-9">
                <h3 className="text-[19px] font-medium text-neutral-900">
                  Trending
                </h3>

                <ul className="mt-3">
                  {TRENDING.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => commit(item)}
                        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] text-neutral-800 transition hover:bg-neutral-50 hover:text-black"
                      >
                        <span className="flex-1 truncate">{item}</span>
                        <ArrowUpRight
                          size={15}
                          className="shrink-0 -translate-x-1 text-neutral-400 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            /* ------------------------ Suggestions / results ------------------------ */
            <div key="typing" className="sp-fade-up">
              <button
                type="button"
                onClick={() => commit(term)}
                className="group flex w-full items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-left text-[15px] text-neutral-900 transition hover:bg-neutral-100"
              >
                <Search size={16} className="shrink-0 text-neutral-500" />
                <span className="flex-1 truncate">
                  Search for <span className="font-semibold">“{term}”</span>
                </span>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 -translate-x-1 text-neutral-500 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </button>

              <h3 className="mb-2 mt-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Suggestions
              </h3>

              {loading && results.length === 0 && (
                <ul aria-label="Loading suggestions" className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-center gap-3 px-2 py-1">
                      <div className="h-14 w-14 animate-pulse rounded-lg bg-neutral-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-100" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {results.length > 0 && (
                <ul
                  className={`transition-opacity duration-200 ${
                    loading ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {results.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => commit(product.title)}
                        className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-neutral-50"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          <img
                            src={product.thumbnail}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] text-neutral-900">
                            {product.title}
                          </p>
                          <p className="mt-0.5 truncate text-[13px] capitalize text-neutral-500">
                            {String(product.category || "").replace(/-/g, " ")}
                            {product.price != null && ` · $${product.price}`}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="shrink-0 -translate-x-1 text-neutral-400 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && term.length >= 2 && results.length === 0 && (
                <p className="px-2 py-4 text-sm text-neutral-500">
                  No quick matches for “{term}”. Press Enter to search the whole
                  store.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}