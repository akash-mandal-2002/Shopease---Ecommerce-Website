import { useState } from "react";

/**
 * Presentational pieces for the header dropdown.
 * All state / hover logic lives in Header.jsx; content lives in navMenuConfig.js.
 */

const isPlainLeftClick = (e) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * Real <a href> so middle-click / "copy link" work, but plain clicks go
 * through the app's own router instead of reloading the page.
 */
function MenuLink({ path, onNavigate, className = "", children, ...rest }) {
  return (
    <a
      href={path}
      onClick={(e) => {
        if (!isPlainLeftClick(e)) return;
        e.preventDefault();
        onNavigate(path);
      }}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

const linkFocus =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2";

/* -------------------------------------------------------------------------- */
/*  Desktop mega menu (lg and up)                                              */
/* -------------------------------------------------------------------------- */

export default function MegaMenu({
  id,
  menus,
  footerLinks = [],
  activeKey,
  panelRef,
  onNavigate,
  onPointerEnter,
  onPointerLeave,
  onBlur,
}) {
  const open = activeKey !== null;

  // Remember the last menu shown so its content stays visible while the
  // panel fades out (otherwise it would blank out before the fade ends).
  const [lastKey, setLastKey] = useState(activeKey);
  if (activeKey !== null && activeKey !== lastKey) setLastKey(activeKey);
  const visibleKey = activeKey ?? lastKey;

  return (
    <>
      {/* Page dimmer: sits under the header bar, never intercepts pointer events */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none fixed inset-0 -z-20 hidden bg-neutral-950/25
          transition-opacity duration-200 ease-out motion-reduce:transition-none
          lg:block
          ${open ? "opacity-100" : "opacity-0"}
        `}
      />

      {/*
        Overlay panel. Absolutely positioned => never pushes page content.
        -z-10 keeps it BEHIND the header bar, and top is pulled up 1px so the two
        always overlap: no hairline seam, no hover dead-zone between them.
      */}
      <div
        id={id}
        ref={panelRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
        className={`
          absolute inset-x-0 top-[calc(100%-1px)] -z-10 hidden
          rounded-b-[18px] bg-neutral-200
          shadow-[0_32px_64px_-24px_rgba(0,0,0,0.35)]
          transition-[opacity,transform,visibility] duration-200 ease-out
          motion-reduce:transition-none
          lg:block
          ${
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0"
          }
        `}
      >
        <div className="px-6 pb-5 pt-9">
          {/* Every menu is stacked in the same grid cell => stable panel height
              and a clean in-place crossfade when moving between nav items. */}
          <div className="grid">
            {Object.entries(menus).map(([key, menu]) => {
              const active = key === visibleKey;

              return (
                <div
                  key={key}
                  data-menu={key}
                  role="group"
                  aria-label={`${key} categories`}
                  className={`
                    col-start-1 row-start-1 grid
                    max-w-[1120px] grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]
                    gap-x-8 transition-[opacity,visibility] ease-out
                    motion-reduce:transition-none xl:gap-x-12
                    ${
                      active
                        ? "visible opacity-100 delay-75 duration-200"
                        : "invisible opacity-0 delay-0 duration-75"
                    }
                  `}
                >
                  {/* Featured: large links, left column */}
                  <ul className="flex flex-col gap-0.5">
                    {menu.featured?.map((link) => (
                      <li key={link.label}>
                        <MenuLink
                          path={link.path}
                          onNavigate={onNavigate}
                          className={`
                            block py-1.5 text-[20px] font-medium leading-tight
                            tracking-[-0.02em] text-neutral-500
                            transition-colors duration-150 hover:text-neutral-950
                            focus-visible:text-neutral-950 xl:text-[22px]
                            ${linkFocus}
                          `}
                        >
                          {link.label}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>

                  {/* Columns: bold heading + quiet links */}
                  {menu.columns?.map((column) => (
                    <div key={column.title} className="min-w-0">
                      <p className="mb-3 pt-2 text-[13px] font-bold text-neutral-950">
                        {column.title}
                      </p>

                      <ul className="flex flex-col">
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <MenuLink
                              path={link.path}
                              onNavigate={onNavigate}
                              className={`
                                block py-1.5 text-[14px] text-neutral-500
                                underline decoration-transparent decoration-1
                                underline-offset-4 transition-colors duration-150
                                hover:text-neutral-950 hover:decoration-orange-600
                                focus-visible:text-neutral-950 ${linkFocus}
                              `}
                            >
                              {link.label}
                            </MenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Utility links, bottom-right (same for every menu) */}
          {footerLinks.length > 0 && (
            <div className="mt-8 flex justify-end gap-6">
              {footerLinks.map((link) => (
                <MenuLink
                  key={link.label}
                  path={link.path}
                  onNavigate={onNavigate}
                  className={`
                    text-[13px] text-neutral-500 transition-colors duration-150
                    hover:text-neutral-950 ${linkFocus}
                  `}
                >
                  {link.label}
                </MenuLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile / tablet accordion body (below lg)                                  */
/* -------------------------------------------------------------------------- */

export function MobileSubmenu({ id, menu, open, onNavigate }) {
  return (
    <div
      id={id}
      inert={!open}
      className={`
        grid transition-[grid-template-rows,opacity] duration-300 ease-out
        motion-reduce:transition-none
        ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
      `}
    >
      <div className="overflow-hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-4 pb-3 pt-2 sm:grid-cols-3">
          {menu.featured?.length > 0 && (
            <ul className="flex flex-col">
              {menu.featured.map((link) => (
                <li key={link.label}>
                  <MenuLink
                    path={link.path}
                    onNavigate={onNavigate}
                    className={`block py-1.5 text-[15px] font-medium text-gray-900 hover:text-orange-600 ${linkFocus}`}
                  >
                    {link.label}
                  </MenuLink>
                </li>
              ))}
            </ul>
          )}

          {menu.columns?.map((column) => (
            <div key={column.title} className="min-w-0">
              <p className="mb-1 pt-1.5 text-xs font-bold text-gray-950">
                {column.title}
              </p>

              <ul className="flex flex-col">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <MenuLink
                      path={link.path}
                      onNavigate={onNavigate}
                      className={`block py-1.5 text-sm text-gray-500 hover:text-gray-950 ${linkFocus}`}
                    >
                      {link.label}
                    </MenuLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}