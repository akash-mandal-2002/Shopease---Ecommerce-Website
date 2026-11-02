import { repositories } from '../repositories/index.js';
import { getProduct, listProducts } from '../services/productService.js';
import { HttpError } from '../utils/httpError.js';

export async function getProducts(req, res) {
  const result = await listProducts(req.query);
  res.json({ success: true, data: result.products, pagination: result.pagination });
}
export async function getProductById(req, res) {
  const product = await getProduct(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found.');
  res.json({ success: true, data: product });
}
export async function getCategories(_req, res) { res.json({ success: true, data: await repositories.categories.findAll() }); }
export async function createProduct(req, res) {
  const body = req.body;
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const price = Number(body.price);
  if (title.length < 2 || !description || !body.categorySlug || !Number.isFinite(price) || price < 0) throw new HttpError(400, 'Title, description, category and a valid non-negative price are required.');
  const stock = Number(body.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, 'Stock must be a non-negative integer.');
  const product = await repositories.products.insert({ id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...body, title, description, price, createdAt: new Date().toISOString(), stock, rating: Number(body.rating || 0), reviewCount: Number(body.reviewCount || 0), images: Array.isArray(body.images) ? body.images : [], tags: Array.isArray(body.tags) ? body.tags : [], variants: Array.isArray(body.variants) ? body.variants : [] });
  res.status(201).json({ success: true, data: product });
}
export async function updateProduct(req, res) {
  const patch = { ...req.body };
  delete patch.id; delete patch._id; delete patch.sourceId; delete patch.source;
  if (patch.price !== undefined && (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)) throw new HttpError(400, 'Price must be a non-negative number.');
  if (patch.stock !== undefined && (!Number.isInteger(Number(patch.stock)) || Number(patch.stock) < 0)) throw new HttpError(400, 'Stock must be a non-negative integer.');
  if (patch.price !== undefined) patch.price = Number(patch.price);
  if (patch.stock !== undefined) patch.stock = Number(patch.stock);
  const product = await repositories.products.update(req.params.id, patch);
  if (!product) throw new HttpError(404, 'Product not found.');
  res.json({ success: true, data: product });
}
export async function deleteProduct(req, res) {
  const deleted = await repositories.products.remove(req.params.id);
  if (!deleted) throw new HttpError(404, 'Product not found.');
  res.json({ success: true, message: 'Product deleted.' });
}
