import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { repositories } from './repositories/index.js';
import { migrateLegacyJsonIfNeeded } from './services/legacyMigrationService.js';
import { syncDummyJsonProductsIfNeeded } from './services/dummyJsonProductService.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ success: true, service: 'ShopEase API', database: 'connected', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  if (error?.name === 'SyntaxError' && Object.prototype.hasOwnProperty.call(error, 'body')) {
    return res.status(400).json({ success: false, message: 'Request body contains invalid JSON.' });
  }
  if (error?.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation failed.', details: Object.values(error.errors).map((item) => item.message) });
  console.error(error);
  const status = Number(error.status) || 500;
  return res.status(status).json({ success: false, message: status >= 500 ? 'Something went wrong on the server.' : error.message, ...(error.details ? { details: error.details } : {}) });
});

async function ensureAdmin() {
  const existingAdmins = (await repositories.users.findAll()).filter((user) => user.role === 'admin');
  if (existingAdmins.length) return;
  if (!env.seedAdminEmail || !env.seedAdminPassword) {
    console.warn('No administrator account exists. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env to seed one.');
    return;
  }
  const email = env.seedAdminEmail.trim().toLowerCase();
  const existingUser = await repositories.users.findOne({ email });
  if (existingUser) {
    await repositories.users.update(existingUser.id, { role: 'admin' });
    console.log(`Promoted ${email} to administrator.`);
    return;
  }
  const password = await bcrypt.hash(env.seedAdminPassword, 12);
  await repositories.users.insert({ id: 'u-admin', name: 'ShopEase Admin', email, phone: '', password, address: '', pincode: '', gender: '', role: 'admin', createdAt: new Date().toISOString() });
  console.log(`Seeded development administrator: ${email}`);
  if (!env.isProduction) console.log('Development admin password is the value configured in SEED_ADMIN_PASSWORD.');
}

async function bootstrap() {
  await connectDatabase();
  await migrateLegacyJsonIfNeeded();
  const syncResult = await syncDummyJsonProductsIfNeeded();
  if (syncResult.synced) console.log(`Synced ${syncResult.count} products from DummyJSON into MongoDB.`);
  await ensureAdmin();
  const server = app.listen(env.port, () => console.log(`ShopEase API running on http://localhost:${env.port}`));
  const shutdown = (signal) => server.close(() => process.exit(signal === 'SIGINT' ? 130 : 0));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('Failed to start ShopEase API:', error.message);
  process.exit(1);
});
