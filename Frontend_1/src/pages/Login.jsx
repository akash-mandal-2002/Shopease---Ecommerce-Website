import AuthForm from '../components/auth/AuthForm';

const perks = [
  'Track your orders in real time',
  'Save items to your wishlist',
  'Faster, secure checkout',
];

export default function Login() {
  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg lg:grid-cols-2">
        {/* Left: brand panel (desktop only) */}
        <aside className="relative hidden flex-col justify-between bg-gray-900 p-10 text-white lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/5"
          />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em]">
              Sign in to continue shopping.
            </h1>
            <p className="mt-3 max-w-sm text-sm text-gray-400">
              Pick up right where you left off: your bag, wishlist and orders are waiting.
            </p>
          </div>

          <ul className="relative mt-10 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm text-gray-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right: form */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14">
          <div className="w-full max-w-sm">
            <AuthForm mode="login" />
          </div>
        </section>
      </div>
    </main>
  );
}