import { repositories } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const safeUser = ({ password, ...user }) => user;
export async function listUsers(_req, res) {
  const users = await repositories.users.findAll();
  res.json({ success: true, data: users.map(safeUser) });
}
export async function updateUserRole(req, res) {
  if (!['admin', 'customer'].includes(req.body.role)) throw new HttpError(400, 'Role must be admin or customer.');
  if (String(req.params.id) === String(req.user.id) && req.body.role !== 'admin') throw new HttpError(400, 'You cannot remove your own administrator role.');
  const user = await repositories.users.update(req.params.id, { role: req.body.role });
  if (!user) throw new HttpError(404, 'User not found.');
  res.json({ success: true, data: safeUser(user) });
}
export async function listPayments(_req, res) {
  const payments = (await repositories.payments.findAll()).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  res.json({ success: true, data: payments });
}
export async function getDashboardReport(_req, res) {
  const [products, users, orders, payments] = await Promise.all([
    repositories.products.findAll(), repositories.users.findAll(), repositories.orders.findAll(), repositories.payments.findAll(),
  ]);
  const revenueOrders = orders.filter((order) => order.status !== 'cancelled' && order.paymentStatus === 'success');
  const revenue = revenueOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const lowStock = products.filter((product) => Number(product.stock || 0) <= 5);
  const statusCounts = orders.reduce((counts, order) => { const key = order.status || 'unknown'; counts[key] = (counts[key] || 0) + 1; return counts; }, {});
  const monthlySales = {};
  for (const order of revenueOrders) {
    const date = new Date(order.orderDate || Date.now());
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlySales[key] = (monthlySales[key] || 0) + Number(order.totalAmount || 0);
  }
  res.json({ success: true, data: {
    generatedAt: new Date().toISOString(), summary: { productCount: products.length, customerCount: users.filter((user) => user.role !== 'admin').length, orderCount: orders.length, revenue, lowStockCount: lowStock.length, paymentCount: payments.length },
    orderStatusCounts: statusCounts, lowStockProducts: lowStock.map((product) => ({ id: product.id, title: product.title, stock: product.stock, category: product.category })),
    monthlySales: Object.entries(monthlySales).sort(([a], [b]) => a.localeCompare(b)).map(([month, amount]) => ({ month, amount })),
  } });
}

export async function deleteUser(req, res) {
  if (String(req.params.id) === String(req.user.id)) throw new HttpError(400, 'You cannot delete your own account.');
  const user = await repositories.users.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  const orders = await repositories.orders.findAll();
  if (orders.some((order) => String(order.userId) === String(user.id))) throw new HttpError(409, 'This user has order history. Deactivate their account by changing their role instead of deleting the record.');
  await repositories.users.remove(user.id);
  const cart = await repositories.carts.findOne({ userId: String(user.id) });
  if (cart) await repositories.carts.remove(cart.id);
  res.json({ success: true, message: 'User deleted.' });
}
