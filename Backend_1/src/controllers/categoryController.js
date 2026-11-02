import { repositories } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export async function createCategory(req, res) {
  const name = String(req.body.name || '').trim();
  if (name.length < 2) throw new HttpError(400, 'Category name must contain at least 2 characters.');
  if (await repositories.categories.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } })) throw new HttpError(409, 'Category already exists.');
  const category = await repositories.categories.insert({ id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, slug: slugify(name), description: String(req.body.description || ''), image: String(req.body.image || ''), createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: category });
}
export async function updateCategory(req, res) {
  const patch = {};
  for (const key of ['name', 'description', 'image']) if (req.body[key] !== undefined) patch[key] = req.body[key];
  if (patch.name !== undefined) { patch.name = String(patch.name).trim(); patch.slug = slugify(patch.name); }
  const category = await repositories.categories.update(req.params.id, patch);
  if (!category) throw new HttpError(404, 'Category not found.');
  res.json({ success: true, data: category });
}
export async function deleteCategory(req, res) {
  const category = await repositories.categories.findById(req.params.id);
  if (!category) throw new HttpError(404, 'Category not found.');
  const products = await repositories.products.findAll();
  if (products.some((product) => product.categorySlug === category.slug)) throw new HttpError(409, 'Move or delete this category’s products before deleting the category.');
  await repositories.categories.remove(req.params.id);
  res.json({ success: true, message: 'Category deleted.' });
}
