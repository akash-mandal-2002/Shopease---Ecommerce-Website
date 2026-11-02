import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useRouter } from "../../context/RouterContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import MegaMenu, { MobileSubmenu } from "./MegaMenu";
import SearchPanel from "./SearchPanel"; // NEW
import { NAV_MENUS, MENU_FOOTER_LINKS } from "./navMenuconfig";

// Hover-intent timings (ms). Opening is slightly delayed so sweeping the cursor
// across the nav doesn't flash menus; closing is delayed so the cursor can cross
// the small gap between a nav item and the dropdown without it disappearing.
const OPEN_DELAY = 80;
const CLOSE_DELAY = 160;

export default function Header() {
  const { navigate, pathname, search } = useRouter();
  const { user } = useAuth();
  const { count } = useCart();
  const { wishlist } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // NEW (replaces `query` state)
  const [scrolled, setScrolled] = useState(false);

  // Dropdown state: `activeMenu` is the desktop mega menu currently open
  // (a nav label or null); `mobileExpanded` is the open accordion row on mobile.
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const hoverTimer = useRef(null);
  const navRef = useRef(null);
  const panelRef = useRef(null);
  const lastPointerType = useRef("mouse");
  const skipFocusOpen = useRef(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handler, { passive: true });

    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
    setMobileExpanded(null);
    setSearchOpen(false); // NEW
  }, [pathname, search]);

  /* ---------------------------- Dropdown behaviour --------------------------- */

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const closeMenu = () => {
    clearHoverTimer();
    setActiveMenu(null);
  };

  const scheduleClose = () => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setActiveMenu(null), CLOSE_DELAY);
  };

  const openMenu = (label, { immediate = false } = {}) => {
    clearHoverTimer();

    // Nav items without a dropdown (e.g. Home): make sure nothing stays open.
    if (!NAV_MENUS[label]) {
      if (activeMenu) scheduleClose();
      return;
    }

    // Already open => switch instantly. Otherwise wait a beat (hover intent).
    if (immediate || activeMenu) setActiveMenu(label);
    else hoverTimer.current = setTimeout(() => setActiveMenu(label), OPEN_DELAY);
  };

  // Touch screens have no hover, so ignore the emulated enter/leave events.
  const handleNavEnter = (event, label) => {
    if (event.pointerType !== "touch") openMenu(label);
  };
  const handleHoverLeave = (event) => {
    if (event.pointerType !== "touch") scheduleClose();
  };
  const handlePanelEnter = (event) => {
    if (event.pointerType !== "touch") clearHoverTimer();
  };

  const handleNavClick = (item) => {
    // Touch on a desktop-width screen (e.g. iPad landscape): first tap opens the
    // dropdown, a second tap on the same item follows its link as before.
    if (
      NAV_MENUS[item.label] &&
      lastPointerType.current === "touch" &&
      activeMenu !== item.label
    ) {
      setActiveMenu(item.label);
      return;
    }

    go(item.path);
  };

  // Keyboard: focusing a nav item previews its menu, ArrowDown moves into it,
  // Escape closes. Enter / Space still activate the link exactly as before.
  const handleNavFocus = (event, label) => {
    // Returning focus after Escape must not immediately reopen the menu.
    if (skipFocusOpen.current) {
      skipFocusOpen.current = false;
      return;
    }

    if (event.currentTarget.matches(":focus-visible")) {
      openMenu(label, { immediate: true });
    }
  };

  const handleNavKeyDown = (event, label) => {
    if (!NAV_MENUS[label]) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveMenu(label);
      // Give the layer a moment to become visible, then move focus inside it.
      setTimeout(() => {
        panelRef.current
          ?.querySelector(`[data-menu="${label}"] a`)
          ?.focus();
      }, 60);
    }
  };

  const handleFocusOut = (event) => {
    const next = event.relatedTarget;

    if (navRef.current?.contains(next) || panelRef.current?.contains(next)) {
      return;
    }

    closeMenu();
  };

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // Dropdown is desktop-only: close it if the viewport shrinks below `lg`.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (event) => {
      if (!event.matches) setActiveMenu(null);
    };

    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  // While a menu is open: tapping/clicking outside or pressing Escape closes it.
  useEffect(() => {
    if (!activeMenu) return undefined;

    const onPointerDown = (event) => {
      if (
        navRef.current?.contains(event.target) ||
        panelRef.current?.contains(event.target)
      ) {
        return;
      }

      setActiveMenu(null);
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;

      const focusWasInPanel = panelRef.current?.contains(document.activeElement);

      setActiveMenu(null);

      if (focusWasInPanel) {
        skipFocusOpen.current = true;
        navRef.current?.querySelector(`[data-nav="${activeMenu}"]`)?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMenu]);

  const toggleMobileSection = (label) =>
    setMobileExpanded((current) => (current === label ? null : label));

  const go = (path) => {
    setMobileOpen(false);
    closeMenu();
    navigate(path);
  };

  /* ------------------------------- Search (NEW) ------------------------------ */

  const openSearch = () => {
    setMobileOpen(false);
    closeMenu();
    setSearchOpen(true);
  };

  const handleSearch = (term) => {
    setSearchOpen(false);
    go(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const nav = [
    { label: "Home", path: "/" },
    { label: "Men", path: "/category/men" },
    { label: "Women", path: "/category/women" },
    { label: "Electronics", path: "/category/electronics" },
    { label: "Beauty", path: "/category/beauty" },
    { label: "Groceries", path: "/category/groceries" },
  ];

  const getIsActive = (item) => {
    const fullLocation = pathname + search;

    if (item.path === "/") {
      return fullLocation === "/";
    }

    // A section stays highlighted on its category page and its subcategory pages.
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  return (
    <header className="sticky top-0 z-50 h-0 w-full">
      <div className="mx-auto px-4 pt-4 sm:px-5 sm:pt-5 lg:px-5 lg:pt-5">
        {/* Positioning context for the dropdown (same width as the bar) */}
        <div className="relative mx-auto max-w-[1560px]">
        <div
          className={`mx-auto flex min-h-[58px] max-w-[1560px] items-center gap-4 rounded-[18px] bg-neutral-200 px-4 transition-[border-radius] duration-200 sm:px-5 lg:px-6 ${
            activeMenu ? "lg:rounded-b-none" : ""
          }`}
        >
          {/* Mobile Menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <div
            
            style={{ fontFamily: "Qurova_Demo" }}
            onClick={() => go("/")}
           
            className="
              text-[22px]
              font-bold
              tracking-wide
              text-neutral-850
              cursor-pointer
            "
          >

            SHOPEASE
            <span className="text-orange-600">.</span>
          </div>

          {/* Desktop Navigation */}

          <nav
            ref={navRef}
            onPointerLeave={handleHoverLeave}
            onBlur={handleFocusOut}
            className="absolute left-1/2 hidden h-10 -translate-x-1/2 items-center gap-0.5 lg:flex"
          >
            {nav.map((item) => {
              const isActive = getIsActive(item);
              const hasMenu = Boolean(NAV_MENUS[item.label]);
              const isOpen = activeMenu === item.label;

              return (
                <button
                  key={item.label}
                  data-nav={item.label}
                  style={{ fontFamily: "Satoshi-Medium" }}
                  onClick={() => handleNavClick(item)}
                  onPointerDown={(e) => {
                    lastPointerType.current = e.pointerType;
                  }}
                  onPointerEnter={(e) => handleNavEnter(e, item.label)}
                  onFocus={(e) => handleNavFocus(e, item.label)}
                  onKeyDown={(e) => handleNavKeyDown(e, item.label)}
                  aria-haspopup={hasMenu ? "true" : undefined}
                  aria-expanded={hasMenu ? isOpen : undefined}
                  aria-controls={hasMenu ? "header-mega-menu" : undefined}
                  className={`
          relative
          flex
          h-10
          items-center
          whitespace-nowrap
          rounded-full
          px-3
          text-[13px]
          font-semibold
          leading-none
          transition-all
          duration-200
          xl:px-3.5
          ${isActive || isOpen
                      ? "text-black"
                      : "text-gray-600  hover:text-black"
                    }
        `}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-orange-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search trigger (NEW – replaces the old inline <form>) */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className="
              ml-auto
              flex
              h-10
              shrink-0
              items-center
              gap-2
              rounded-full
              px-2
              text-black
              transition
              hover:bg-black/5
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-black/40
              sm:px-3
            "
          >
            <Search size={16} strokeWidth={2} />

            <span
              style={{ fontFamily: "Satoshi-Medium" }}
              className="hidden text-[16px] font-bold leading-none sm:block"
            >
              Search
            </span>
          </button>

          {/* Actions */}
       <div className="flex shrink-0 items-center gap-0">
  {/* Account */}
  <button
    onClick={() => go(user ? "/account" : "/login")}
    className={`
      flex
      h-9
      items-center
      gap-1
      rounded-full
      px-1.5
      text-gray-600
      transition
      hover:bg-gray-100
      hover:text-black
      sm:px-2
      ${
        pathname === "/account" || pathname === "/login"
          ? "bg-gray-100 text-black"
          : ""
      }
    `}
    aria-label="Account"
  >
    <UserRound size={17} strokeWidth={1.8} />

    <span className="hidden text-[13px] font-medium sm:block">
      {user?.name?.split(" ")[0]}
    </span>
  </button>

  {/* Cart */}
  <button
    onClick={() => go("/cart")}
    className="
      relative
      flex
      h-9
      w-9
      items-center
      justify-center
      rounded-full
      text-gray-600
      transition
      hover:bg-gray-100
      hover:text-black
    "
    aria-label="Cart"
  >
    <ShoppingBag size={17} strokeWidth={1.8} />

    {count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[8px] font-bold text-white">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </button>

  {/* Admin */}
  {user?.role === "admin" && (
    <button
      onClick={() => go("/admin")}
      className="
        hidden
        h-9
        items-center
        gap-1
        rounded-full
        bg-amber-50
        px-2
        text-xs
        font-semibold
        text-amber-700
        hover:bg-amber-100
        xl:flex
      "
    >
      <LayoutDashboard size={14} />
      Admin
    </button>
  )}
</div>
        </div>

        {/* Desktop dropdown (overlay, anchored to the bar above) */}
        <MegaMenu
          id="header-mega-menu"
          menus={NAV_MENUS}
          footerLinks={MENU_FOOTER_LINKS}
          activeKey={activeMenu}
          panelRef={panelRef}
          onNavigate={go}
          onPointerEnter={handlePanelEnter}
          onPointerLeave={handleHoverLeave}
          onBlur={handleFocusOut}
        />
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div
            className="
              mx-auto
              mt-2
              max-w-[1560px]
              max-h-[calc(100dvh-110px)]
              overflow-y-auto
              overscroll-contain
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-3
              shadow-xl
              lg:hidden
            "
          >
            <div className="grid gap-1">
              {nav.map((item) => {
                const isActive = getIsActive(item);
                const menu = NAV_MENUS[item.label];
                const expanded = mobileExpanded === item.label;
                const sectionId = `mobile-menu-${item.label}`;

                return (
                  <div key={item.label}>
                    <div className="flex items-stretch gap-1">
                      <button
                        onClick={() => go(item.path)}
                        className={`
                          flex-1
                          rounded-xl
                          px-4
                          py-3
                          text-left
                          text-sm
                          font-medium
                          transition
                          ${isActive
                            ? "bg-gray-100 text-black"
                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                          }
                        `}
                      >
                        {item.label}
                      </button>

                      {menu && (
                        <button
                          onClick={() => toggleMobileSection(item.label)}
                          aria-expanded={expanded}
                          aria-controls={sectionId}
                          aria-label={`${expanded ? "Hide" : "Show"} ${item.label} categories`}
                          className="flex w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-50 hover:text-black"
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-300 ${
                              expanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {menu && (
                      <MobileSubmenu
                        id={sectionId}
                        menu={menu}
                        open={expanded}
                        onNavigate={go}
                      />
                    )}
                  </div>
                );
              })}

              <div className="my-1 " />

              <button
                onClick={() => go("/wishlist")}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Wishlist
                {wishlist.length > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => go("/orders")}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Orders
              </button>

              <button
                onClick={() => go(user ? "/account" : "/login")}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {user ? "Account" : "Sign In"}
              </button>

              {user?.role === "admin" && (
                <button
                  onClick={() => go("/admin")}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  Admin Control Room
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide-in search panel (NEW) – renders into document.body via a portal */}
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
      />
    </header>
  );
}