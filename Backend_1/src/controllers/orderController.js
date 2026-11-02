import { repositories } from '../repositories/index.js';
import { createOrder } from '../services/orderService.js';
import { HttpError } from '../utils/httpError.js';

export async function placeOrder(req, res) {
  const { shippingAddress, paymentMethod } = req.body;
  if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.pincode) throw new HttpError(400, 'Complete shipping details are required.');
  if (!['upi', 'card', 'netbanking', 'cod'].includes(paymentMethod)) throw new HttpError(400, 'Unsupported payment method.');
  const order = await createOrder({ userId: req.user.id, shippingAddress, paymentMethod });
  res.status(201).json({ success: true, data: order, paymentMode: 'demo' });
}
export async function getMyOrders(req, res) {
  const orders = (await repositories.orders.findAll()).filter((order) => String(order.userId) === String(req.user.id)).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  res.json({ success: true, data: orders });
}
export async function getAllOrders(_req, res) { res.json({ success: true, data: (await repositories.orders.findAll()).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) }); }
export async function updateOrderStatus(req, res) {
  const allowed = ['confirmed', 'dispatched', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) throw new HttpError(400, 'Invalid order status.');
  const existing = await repositories.orders.findById(req.params.id);
  if (!existing) throw new HttpError(404, 'Order not found.');
  if (existing.status === 'delivered' && req.body.status !== 'delivered') throw new HttpError(409, 'Delivered orders cannot be moved to an earlier status.');
  const order = await repositories.orders.update(req.params.id, { status: req.body.status });
  res.json({ success: true, data: order });
}
export async function cancelMyOrder(req, res) {
  const order = await repositories.orders.findById(req.params.id);
  if (!order || String(order.userId) !== String(req.user.id)) throw new HttpError(404, 'Order not found.');
  if (!['confirmed'].includes(order.status)) throw new HttpError(409, 'Only confirmed orders can be cancelled. Contact support for help with later statuses.');
  const updated = await repositories.orders.update(order.id, { status: 'cancelled', cancelledAt: new Date().toISOString() });
  // Restore inventory when an order is cancelled before dispatch.
  for (const item of order.items || []) {
    const product = await repositories.products.findById(item.productId);
    if (product) await repositories.products.update(product.id, { stock: Number(product.stock || 0) + Number(item.quantity || 0) });
  }
  res.json({ success: true, data: updated });
}
export async function requestReturn(req, res) {
  const order = await repositories.orders.findById(req.params.id);
  if (!order || String(order.userId) !== String(req.user.id)) throw new HttpError(404, 'Order not found.');
  if (order.status !== 'delivered') throw new HttpError(409, 'Returns can only be requested for delivered orders.');
  if (order.returnStatus && order.returnStatus !== 'not_requested') throw new HttpError(409, 'A return request already exists for this order.');
  const reason = String(req.body.reason || '').trim();
  if (reason.length < 5) throw new HttpError(400, 'Please provide a return reason of at least 5 characters.');
  const updated = await repositories.orders.update(order.id, { returnStatus: 'requested', returnReason: reason, returnRequestedAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: updated });
}
export async function getInvoice(req, res) {
  const order = await repositories.orders.findById(req.params.id);
  if (!order || (req.user.role !== 'admin' && String(order.userId) !== String(req.user.id))) throw new HttpError(404, 'Invoice not found.');
  const payments = await repositories.payments.findAll();
  const payment = payments.find((entry) => entry.orderId === order.id) || null;
  res.json({ success: true, data: { invoiceNumber: `INV-${order.id}`, issuedAt: order.orderDate, order, payment, currency: 'INR', paymentDisclaimer: 'Digital payment is simulated in this academic demo; no real gateway transaction is performed.' } });
}

export async function updateReturnStatus(req, res) {
  const allowed = ['approved', 'rejected', 'received', 'refunded'];
  if (!allowed.includes(req.body.returnStatus)) throw new HttpError(400, 'Invalid return status.');
  const order = await repositories.orders.findById(req.params.id);
  if (!order) throw new HttpError(404, 'Order not found.');
  if (!order.returnStatus || order.returnStatus === 'not_requested') throw new HttpError(409, 'This order has no return request.');
  const updated = await repositories.orders.update(order.id, { returnStatus: req.body.returnStatus, returnReviewedAt: new Date().toISOString(), returnAdminNote: String(req.body.note || '').trim() });
  res.json({ success: true, data: updated });
}
