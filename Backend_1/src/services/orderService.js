import { repositories } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const calculateSubtotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export async function createOrder({ userId, shippingAddress, paymentMethod }) {
  const cart = await repositories.carts.findOne({ userId: String(userId) });
  if (!cart || !cart.items?.length) throw new HttpError(400, 'Your cart is empty.');
  const orderItems = [];
  for (const item of cart.items) {
    const product = await repositories.products.findById(item.productId);
    if (!product) throw new HttpError(400, `Product ${item.productId} is no longer available.`);
    if (!Number.isInteger(Number(item.quantity)) || item.quantity < 1 || Number(product.stock || 0) < item.quantity) throw new HttpError(400, `${product.title} has insufficient stock.`);
    orderItems.push({ productId: product.id, title: product.title, image: product.images?.[0] || '', price: Number(product.price) || 0, quantity: item.quantity });
  }
  const subtotal = calculateSubtotal(orderItems);
  const shipping = subtotal >= 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + shipping + tax;
  const now = new Date().toISOString();
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  // This academic build simulates digital payment outcomes. No real payment gateway is connected.
  const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'success';
  const order = { id: orderId, userId: String(userId), orderDate: now, status: 'confirmed', returnStatus: 'not_requested', shippingAddress, items: orderItems, subtotal, shipping, tax, totalAmount, paymentMethod, paymentStatus };

  // Validate first, then decrement stock. Roll back completed decrements if a later write fails.
  const decremented = [];
  try {
    for (const item of orderItems) {
      const product = await repositories.products.findById(item.productId);
      if (!product || Number(product.stock || 0) < item.quantity) throw new HttpError(409, `${item.title} stock changed. Please review your cart.`);
      const updated = await repositories.products.update(product.id, { stock: Number(product.stock || 0) - item.quantity });
      if (!updated) throw new HttpError(409, `${item.title} is no longer available.`);
      decremented.push({ id: product.id, quantity: item.quantity });
    }
    await repositories.orders.insert(order);
    await repositories.payments.insert({ id: `PAY-${Date.now().toString(36).toUpperCase()}`, orderId, amount: totalAmount, method: paymentMethod, provider: 'demo', transactionId: paymentMethod === 'cod' ? null : `DEMO-TXN-${Date.now()}`, status: paymentStatus, paymentDate: now, note: paymentMethod === 'cod' ? 'Cash on delivery' : 'Simulated payment; no real gateway transaction occurred.' });
    await repositories.carts.remove(cart.id);
    return order;
  } catch (error) {
    for (const item of decremented) {
      const current = await repositories.products.findById(item.id);
      if (current) await repositories.products.update(item.id, { stock: Number(current.stock || 0) + item.quantity });
    }
    const partialOrder = await repositories.orders.findById(orderId);
    if (partialOrder) await repositories.orders.remove(orderId);
    const partialPayments = await repositories.payments.findAll();
    for (const payment of partialPayments.filter((entry) => entry.orderId === orderId)) await repositories.payments.remove(payment.id);
    throw error;
  }
}
