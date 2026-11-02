import { Product, Category, User, Cart, Order, Payment, Inquiry } from '../models/index.js';
import { createMongoRepository } from './mongoRepository.js';

export const repositories = {
  products: createMongoRepository(Product),
  categories: createMongoRepository(Category),
  users: createMongoRepository(User),
  carts: createMongoRepository(Cart),
  orders: createMongoRepository(Order),
  payments: createMongoRepository(Payment),
  inquiries: createMongoRepository(Inquiry),
};
