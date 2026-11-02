# ShopEase Backend — MongoDB edition

Express REST API for the ShopEase MERN e-commerce academic project. Persistence is handled by MongoDB/Mongoose; the React/Vite client continues to use the existing `/api` routes and the existing public string IDs.

## Setup

1. Use Node.js 20.19+ or a version compatible with your installed dependencies.
2. In this directory, run `npm install`.
3. Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI. Do not commit `.env`.
4. Ensure the Atlas database user's username/password are correct and its IP access list allows your current IP.
5. Run `npm run dev`.
6. Check `http://localhost:5000/api/health`.

### Environment variables

- `MONGODB_URI`: MongoDB connection string; must start with `mongodb://` or `mongodb+srv://`.
- `PORT`: API port (default 5000).
- `CLIENT_URL`: exact frontend origin (default `http://localhost:5173`).
- `JWT_SECRET`: use a random secret of at least 32 characters in production.
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`: development admin seed values. Configure strong values before deployment.
- `USE_DUMMYJSON_PRODUCTS`: allow initial catalog fetch only when MongoDB products are empty.
- `DUMMYJSON_PRICE_MULTIPLIER`: demo price conversion multiplier (default 85).

## Data migration

On startup, `legacyMigrationService.js` imports each `src/data/*.json` file only if its matching MongoDB collection is empty. It never overwrites a non-empty collection. The JSON files are retained as a migration source; do not delete them until you verify collection counts and test the app. Back up the `src/data` directory before the first run.

The migration is per collection and idempotent for normal startup: populated collections are skipped. Review any duplicate-key errors rather than deleting production data to force a retry.

## API overview

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/profile`
- `GET /api/products`, `GET /api/products/:id`, admin `POST/PATCH/DELETE /api/products`
- `GET /api/products/categories`; admin category management at `/api/categories`
- Authenticated cart endpoints at `/api/cart`
- Checkout and customer order history at `/api/orders`; admin order status management; invoice JSON at `/api/orders/:id/invoice`; cancellation and return requests
- Admin customer management and reports at `/api/admin/users`, `/api/admin/reports`; payment listing at `/api/admin/payments`; return review at `/api/admin/orders/:id/return-status`
- Customer inquiries at `/api/inquiries`; admin handling at `/api/admin/inquiries`

All admin routes require a valid bearer token with the `admin` role. The API never returns user password hashes in public user responses.

## Payment limitation

UPI, card and net-banking outcomes are simulated for this academic project; this backend does not connect to a real payment gateway and must not be presented as processing real payments. COD is recorded as pending. A production deployment needs a payment provider, verified webhooks, and appropriate security review.

## Proposal coverage

The backend supports authentication and role checks, product/category management, customer carts/profiles, order lifecycle and stock updates, payment records, invoice data, return requests, customer inquiries, and admin summary reports. Frontend screens must call these endpoints for the end-to-end features to be considered complete. Tests against a live Atlas database and frontend integration should be run before submission.
