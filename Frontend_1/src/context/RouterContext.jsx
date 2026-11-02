import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext(null);

function parsePath(fullPath) {
  const idx = fullPath.indexOf('?');
  if (idx === -1) return { pathname: fullPath, search: '' };
  return { pathname: fullPath.slice(0, idx), search: fullPath.slice(idx) };
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(() => `${window.location.pathname}${window.location.search}`);

  useEffect(() => {
    const handler = () => setLocation(`${window.location.pathname}${window.location.search}`);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((to) => {
    if (to === location) return;
    window.history.pushState({}, '', to);
    setLocation(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const value = useMemo(() => {
    const { pathname, search } = parsePath(location);
    return { location, pathname, search, navigate };
  }, [location, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);
