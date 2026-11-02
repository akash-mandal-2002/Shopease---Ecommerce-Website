import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongoUri) throw new Error('MONGODB_URI is missing from Backend/.env. Copy .env.example and add your MongoDB Atlas connection string.');
  if (!/^mongodb(\+srv)?:\/\//i.test(env.mongoUri)) {
    throw new Error('MONGODB_URI must begin with mongodb:// or mongodb+srv://.');
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
  });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
