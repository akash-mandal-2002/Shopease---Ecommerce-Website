import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import { EmptyState } from './components/common/States';
import Button from './components/common/Button';

function RouteView() {
  const { pathname, navigate } = useRouter();
  let content;
  if (pathname === '/') content = <Home/>;
  else if (pathname === '/shop') content = <Shop/>;
  else if (pathname.startsWith('/category/')) { const [group, sub] = pathname.split('/').filter(Boolean).slice(1); content = <Category group={group} sub={sub}/>; }
  else if (pathname.startsWith('/product/')) content = <ProductDetails id={pathname.split('/')[2]}/>;
  else if (pathname === '/cart') content = <Cart/>;
  else if (pathname === '/wishlist') content = <Wishlist/>;
  else if (pathname === '/checkout') content = <Checkout/>;
  else if (pathname === '/login') content = <Login/>;
  else if (pathname === '/register') content = <Register/>;
  else if (pathname === '/account') content = <Account/>;
  else if (pathname === '/orders') content = <Orders/>;
  else if (pathname === '/admin') content = <Admin/>;
  else content = <main className="mx-auto max-w-2xl px-4 py-20"><EmptyState title="Page not found" message="The page you requested does not exist."/><div className="mt-5 text-center"><Button onClick={() => navigate('/')}>Back home</Button></div></main>;
  return <><Header/><div className="min-h-[calc(100vh-76px)]">{content}</div><Footer/></>;
}

export default function App() { return <RouterProvider><AuthProvider><CartProvider><WishlistProvider><RouteView/></WishlistProvider></CartProvider></AuthProvider></RouterProvider>; }
