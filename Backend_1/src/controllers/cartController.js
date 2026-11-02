import { repositories } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

async function getCart(userId) {
  const cart = await repositories.carts.findOne({ userId: String(userId) });
  if (!cart) return { id: `cart-${userId}`, userId, items: [], totalPrice: 0, updatedAt: new Date().toISOString() };
  const products = await repositories.products.findAll();
  const items = (cart.items || []).map((item) => {
    const product = products.find((entry) => String(entry.id) === String(item.productId));
    if (!product) return null;
    return { productId: product.id, title: product.title, image: product.images?.[0] || '', price: Number(product.price) || 0, stock: Number(product.stock) || 0, quantity: item.quantity, variant: item.variant || null };
  }).filter(Boolean);
  return { ...cart, items, totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
}
export async function readCart(req, res) { res.json({ success: true, data: await getCart(req.user.id) }); }

export async function addToCart(req, res) {
  const productId = String(req.body.productId || '');
  const quantity = Number(req.body.quantity ?? 1);
  const variant = req.body.variant ?? null;
  if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new HttpError(400, 'A product and a quantity between 1 and 99 are required.');
  const product = await repositories.products.findById(productId);
  if (!product) throw new HttpError(404, 'Product not found.');
  const cart = await repositories.carts.findOne({ userId: String(req.user.id) }) || { id: `cart-${req.user.id}`, userId: String(req.user.id), items: [] };
  const items = cart.items || [];
  const existing = items.find((item) => String(item.productId) === productId && (item.variant ?? null) === variant);
  const nextQuantity = (existing?.quantity || 0) + quantity;
  if (nextQuantity > Number(product.stock || 0)) throw new HttpError(400, `Only ${product.stock || 0} item(s) are available.`);
  if (existing) existing.quantity = nextQuantity;
  else items.push({ productId, quantity, variant });
  cart.items = items;
  cart.updatedAt = new Date().toISOString();
  if (await repositories.carts.findById(cart.id)) await repositories.carts.update(cart.id, cart);
  else await repositories.carts.insert(cart);
  res.status(201).json({ success: true, data: await getCart(req.user.id) });
}

export async function updateCartItem(req, res) {
  const cart = await repositories.carts.findOne({ userId: String(req.user.id) });
  if (!cart) throw new HttpError(404, 'Cart not found.');
  const item = (cart.items || []).find((entry) => String(entry.productId) === String(req.params.productId));
  if (!item) throw new HttpError(404, 'Cart item not found.');
  const product = await repositories.products.findById(req.params.productId);
  if (!product) throw new HttpError(404, 'Product not found.');
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > Number(product.stock || 0)) throw new HttpError(400, 'Invalid quantity or insufficient stock.');
  item.quantity = quantity;
  cart.updatedAt = new Date().toISOString();
  await repositories.carts.update(cart.id, { items: cart.items, updatedAt: cart.updatedAt });
  res.json({ success: true, data: await getCart(req.user.id) });
}

export async function removeCartItem(req, res) {
  const cart = await repositories.carts.findOne({ userId: String(req.user.id) });
  if (!cart) throw new HttpError(404, 'Cart not found.');
  const nextItems = (cart.items || []).filter((entry) => String(entry.productId) !== String(req.params.productId));
  if (nextItems.length === (cart.items || []).length) throw new HttpError(404, 'Cart item not found.');
  await repositories.carts.update(cart.id, { items: nextItems, updatedAt: new Date().toISOString() });
  res.json({ success: true, data: await getCart(req.user.id) });
}
