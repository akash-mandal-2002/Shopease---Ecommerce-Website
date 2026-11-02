import mongoose from 'mongoose';

const { Schema } = mongoose;
const Mixed = Schema.Types.Mixed;

function createCollectionModel(modelName, collectionName, fields, extraIndexes = []) {
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  const schema = new Schema(
    { id: { type: String, required: true, unique: true }, ...fields },
    { collection: collectionName, strict: false, versionKey: false, timestamps: false, minimize: false },
  );
  for (const index of extraIndexes) schema.index(index.fields, index.options || {});
  return mongoose.model(modelName, schema);
}

export const Product = createCollectionModel('ShopEaseProduct', 'products', {
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  discount: { type: Number, min: 0, max: 100 },
  category: String,
  categorySlug: String,
  subcategory: String,
  brand: String,
  images: { type: [String], default: [] },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, min: 0, default: 0 },
  stock: { type: Number, min: 0, default: 0 },
  tags: { type: [String], default: [] },
  variants: { type: [Mixed], default: [] },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  new: { type: Boolean, default: false },
  createdAt: String,
  source: String,
  sourceId: Mixed,
}, [
  { fields: { categorySlug: 1 } },
  { fields: { source: 1, sourceId: 1 }, options: { sparse: true } },
]);

export const Category = createCollectionModel('ShopEaseCategory', 'categories', {
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  createdAt: String,
}, [{ fields: { slug: 1 }, options: { sparse: true } }]);

export const User = createCollectionModel('ShopEaseUser', 'users', {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  gender: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: String,
}, [{ fields: { email: 1 }, options: { unique: true } }]);

export const Cart = createCollectionModel('ShopEaseCart', 'carts', {
  userId: { type: String, required: true },
  items: { type: [Mixed], default: [] },
  updatedAt: String,
}, [{ fields: { userId: 1 }, options: { unique: true } }]);

export const Order = createCollectionModel('ShopEaseOrder', 'orders', {
  userId: { type: String, required: true },
  orderDate: String,
  status: { type: String, enum: ['confirmed', 'dispatched', 'delivered', 'cancelled'], default: 'confirmed' },
  returnStatus: { type: String, enum: ['not_requested', 'requested', 'approved', 'rejected', 'received', 'refunded'], default: 'not_requested' },
  returnReason: String,
  shippingAddress: Mixed,
  items: { type: [Mixed], default: [] },
  subtotal: { type: Number, min: 0 },
  shipping: { type: Number, min: 0 },
  tax: { type: Number, min: 0 },
  totalAmount: { type: Number, min: 0 },
  paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'cod'] },
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
}, [{ fields: { userId: 1, orderDate: -1 } }]);

export const Payment = createCollectionModel('ShopEasePayment', 'payments', {
  orderId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'cod'] },
  provider: String,
  transactionId: { type: String, default: null },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paymentDate: String,
  note: String,
}, [{ fields: { orderId: 1 } }]);

export const Inquiry = createCollectionModel('ShopEaseInquiry', 'inquiries', {
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  createdAt: String,
  updatedAt: String,
});
