import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('In production, JWT_SECRET must be set to a random value of at least 32 characters.');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: jwtSecret || 'development-only-secret-change-me',
  mongoUri: process.env.MONGODB_URI || '',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || (isProduction ? '' : 'admin@shopease.local'),
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || (isProduction ? '' : 'Admin@12345'),
  useDummyJsonProducts: String(process.env.USE_DUMMYJSON_PRODUCTS ?? 'true').toLowerCase() === 'true',
  dummyJsonPriceMultiplier: Number(process.env.DUMMYJSON_PRICE_MULTIPLIER || 85),
};
