import { repositories } from '../repositories/index.js';
import { env } from '../config/env.js';

const DUMMY_JSON_PRODUCTS_URL = 'https://dummyjson.com/products?limit=0';

function titleCase(value = '') {
  return value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
function calculateMrp(price, discountPercentage) {
  const discount = Number(discountPercentage) || 0;
  if (discount <= 0 || discount >= 100) return Math.round(price);
  return Math.round(price / (1 - discount / 100));
}
function normalizeProduct(product) {
  const price = Math.max(0, Math.round(Number(product.price || 0) * env.dummyJsonPriceMultiplier));
  const discount = Math.max(0, Math.round(Number(product.discountPercentage || 0)));
  return {
    id: `dummy-${product.id}`, title: product.title, description: product.description, price,
    mrp: calculateMrp(price, discount), discount, category: titleCase(product.category),
    categorySlug: product.category, subcategory: titleCase(product.category), brand: product.brand || 'ShopEase',
    images: Array.isArray(product.images) && product.images.length ? product.images : [product.thumbnail].filter(Boolean),
    rating: Number(product.rating || 0), reviewCount: Array.isArray(product.reviews) ? product.reviews.length : 0,
    stock: Number(product.stock || 0), tags: Array.isArray(product.tags) ? product.tags : [], variants: [],
    featured: Number(product.rating || 0) >= 4.5, trending: Number(product.rating || 0) >= 4.6,
    new: Number(product.discountPercentage || 0) >= 15, createdAt: product.meta?.createdAt || new Date().toISOString(),
    source: 'dummyjson', sourceId: product.id,
  };
}

export async function fetchDummyJsonProducts() {
  const response = await fetch(DUMMY_JSON_PRODUCTS_URL, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`DummyJSON request failed with status ${response.status}.`);
  const payload = await response.json();
  if (!Array.isArray(payload.products)) throw new Error('DummyJSON returned an invalid products response.');
  return payload.products.map(normalizeProduct);
}

export async function syncDummyJsonProducts() {
  const products = await fetchDummyJsonProducts();
  await repositories.products.replace(products);
  const categoryMap = new Map();
  for (const product of products) {
    if (!categoryMap.has(product.categorySlug)) categoryMap.set(product.categorySlug, {
      id: `cat-${product.categorySlug}`, name: product.category, slug: product.categorySlug,
      description: `Explore ${product.category.toLowerCase()} products.`, image: product.images[0] || '',
      createdAt: new Date().toISOString(),
    });
  }
  await repositories.categories.replace([...categoryMap.values()]);
  return products;
}

export async function syncDummyJsonProductsIfNeeded() {
  if (!env.useDummyJsonProducts) return { synced: false, reason: 'disabled' };
  const products = await repositories.products.findAll();
  if (products.some((product) => product.source === 'dummyjson')) {
    return { synced: false, reason: 'already-synced', count: products.length };
  }
  if (products.length > 0) return { synced: false, reason: 'existing-catalog-preserved', count: products.length };
  try {
    const syncedProducts = await syncDummyJsonProducts();
    return { synced: true, count: syncedProducts.length };
  } catch (error) {
    console.warn(`DummyJSON sync skipped: ${error.message}`);
    return { synced: false, reason: 'external-api-unavailable', count: products.length };
  }
}
