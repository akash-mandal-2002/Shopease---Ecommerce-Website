# ShopEase Frontend

React + Vite storefront for the ShopEase BCA ecommerce project.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

The frontend expects the REST API at `VITE_API_URL` (default: `http://localhost:5000/api`).

### Main areas
- `src/pages` — route-level pages
- `src/components` — reusable UI and page sections
- `src/context` — authentication, cart, wishlist and lightweight routing state
- `src/services` — centralized API clients
- `src/utils` — shared helpers
- `src/assets` — existing ShopEase visual assets
