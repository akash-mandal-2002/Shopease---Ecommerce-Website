import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

/*
  Footer link groups.
  Routes that already exist in your app: /shop, /shop?category=..., /account, /wishlist, /orders.
  Anything else (/help, /about, ...) is a placeholder: point it to a real page when you build it.
*/
const columns = [
    {
        title: 'Shop',
        links: [
            { label: 'Shop All', to: '/shop' },
            { label: 'Fashion', to: '/shop?category=fashion' },
            { label: 'Electronics', to: '/shop?category=electronics' },
            { label: 'Home & Living', to: '/shop?category=home' },
            { label: 'Beauty', to: '/shop?category=beauty' },
            { label: 'Books', to: '/shop?category=books' },
        ],
    },
    {
        title: 'My Account',
        links: [
            { label: 'Sign In', to: '/account' },
            { label: 'Register', to: '/account' },
            { label: 'Order Status', to: '/orders' },
            { label: 'Wishlist', to: '/wishlist' },
            { label: 'Returns', to: '/orders' },
        ],
    },
    {
        title: 'Help',
        links: [
            { label: 'Ordering', to: '/help' },
            { label: 'Returns and Refunds', to: '/help' },
            { label: 'Shipping and Delivery', to: '/help' },
            { label: 'Payment', to: '/help' },
            { label: 'Product and Sizing', to: '/help' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Use', to: '/terms' },
            { label: 'Accessibility', to: '/accessibility' },
        ],
    },
    {
        title: 'About Us',
        links: [
            { label: 'Our Story', to: '/about' },
            { label: 'The Project', to: '/about' },
            { label: 'Tech Stack', to: '/about' },
        ],
    },
    {
        title: 'Contact Us',
        links: [
            { label: 'Live Chat', to: '/contact' },
            { label: 'Email Us', to: '/contact' },
            { label: 'Sitemap', to: '/sitemap' },
        ],
    },
];

const socials = [
    { label: 'Instagram', Icon: Instagram },
    { label: 'Twitter', Icon: Twitter },
    { label: 'Facebook', Icon: Facebook },
    { label: 'YouTube', Icon: Youtube },
];

export default function Footer() {
    const { navigate } = useRouter();

    return (
        <footer className="">
            {/* Welcome band */}
            <section className="bg-gray-50">
                <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div>
                        <h2 style={{ fontFamily: "Satoshi-Medium" }} className="text-lg tracking-tight text-gray-800 sm:text-5xl">
                            New to ShopEase?
                        </h2>
                        <p className="mt-3 text-base text-gray-600">
                            Browse the basics, find what you like, and start filling your cart.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/shop')}
                        className="w-fit rounded-full bg-gray-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    >
                        Start Here
                    </button>
                </div>
            </section>

            {/* Link columns */}
            <section className="bg-gray-950 text-gray-300">
                <div className="mx-auto max-w-[1500px] px-4 pb-8 pt-14 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
                        {columns.map((col) => (
                            <nav key={col.title} aria-label={col.title}>
                                <h3 className="text-sm font-semibold text-white">{col.title}</h3>
                                <ul className="mt-4 grid gap-2.5 text-sm">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <button
                                                onClick={() => navigate(link.to)}
                                                className="text-left text-gray-400 transition hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline"
                                            >
                                                {link.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>

                    {/* Brand + socials */}
                    <div className="mt-14 flex flex-col gap-8 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-sm">
                            <button
                                onClick={() => navigate('/')}
                                className="text-2xl font-black tracking-[-0.06em] text-white"
                            >
                                SHOPEASE<span className="text-orange-500">.</span>
                            </button>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                                Everyday products across tech, fashion, home, beauty and books, all in one place.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {socials.map(({ label, Icon }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="rounded-full border border-white/20 p-2.5 text-gray-300 transition hover:border-white hover:bg-white hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-8 flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>© {new Date().getFullYear()} ShopEase. A MERN-style BCA academic project.</p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/privacy')} className="hover:text-white">
                                Privacy Policy
                            </button>
                            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                            <button onClick={() => navigate('/terms')} className="hover:text-white">
                                Terms of Use
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </footer>
    );
}