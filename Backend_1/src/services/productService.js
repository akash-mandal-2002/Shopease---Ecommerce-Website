import { repositories } from '../repositories/index.js';

export async function listProducts({ search = '', category = 'all', brand = 'all', sort = 'featured', page = 1, limit = 12 } = {}) {
  const products = await repositories.products.findAll();
  const query = String(search).trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesSearch = !query || [product.title, product.brand, product.category, product.subcategory, ...(product.tags || [])].some((value) => String(value || '').toLowerCase().includes(query));
    const matchesCategory = category === 'all' || product.categorySlug === category || product.category === category;
    const matchesBrand = brand === 'all' || product.brand === brand;
    return matchesSearch && matchesCategory && matchesBrand;
  });
  const sorters = {
    price_asc: (a, b) => Number(a.price || 0) - Number(b.price || 0),
    price_desc: (a, b) => Number(b.price || 0) - Number(a.price || 0),
    rating: (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
    newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    featured: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  };
  filtered.sort(sorters[sort] || sorters.featured);
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeLimit = Math.min(48, Math.max(1, Math.floor(Number(limit) || 12)));
  const total = filtered.length;
  return { products: filtered.slice((safePage - 1) * safeLimit, safePage * safeLimit), pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } };
}
export async function getProduct(id) { return repositories.products.findById(id); }
