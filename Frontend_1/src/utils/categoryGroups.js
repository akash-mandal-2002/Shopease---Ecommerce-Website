/**
 * Header section  ->  product-category slugs that belong to it.
 *
 * The slugs are the same ones the API returns from /products/categories and
 * accepts in /products?category=<slug>. A category page only lists the
 * categories that (a) are listed here, or (b) match one of the group's
 * `prefixes`, AND (c) actually exist in the API response - so nothing is shown
 * that isn't in the database, and new "mens-*" / "womens-*" categories added
 * later appear automatically.
 *
 * `banner` = image shown at the top of that section's category page. Put your
 * own image in public/Image/category-banners/ and change the path here.
 *
 * Order here = display order. Some slugs (sunglasses, skin-care, fragrances)
 * are shared by design: the product data has no men/women split for them.
 */

import Banner from '../assets/Image/Pages/MenBanner.png'

export const CATEGORY_GROUPS = {
  men: {
    label: 'Men',
    banner: Banner,
    slugs: [
      'mens-shirts',
      'mens-shoes',
      'mens-watches',
      'sunglasses',
      'sports-accessories',
      'fragrances',
      'skin-care',
    ],
    prefixes: ['mens-'],
  },
  women: {
    label: 'Women',
    banner: Banner,
    slugs: [
      'womens-dresses',
      'tops',
      'womens-shoes',
      'womens-bags',
      'womens-jewellery',
      'womens-watches',
      'sunglasses',
      'beauty',
      'skin-care',
      'fragrances',
    ],
    prefixes: ['womens-'],
  },
  electronics: {
    label: 'Electronics',
    banner: Banner,
    slugs: ['laptops', 'smartphones', 'tablets', 'mobile-accessories'],
    prefixes: [],
  },
  beauty: {
    label: 'Beauty',
    banner: Banner,
    slugs: ['beauty', 'skin-care', 'fragrances'],
    prefixes: [],
  },
  groceries: {
    label: 'Groceries',
    banner: Banner,
    slugs: ['groceries', 'kitchen-accessories', 'home-decoration'],
    prefixes: [],
  },
};

export const getGroup = (key) => CATEGORY_GROUPS[key] || null;

export const groupPath = (key) => `/category/${key}`;
export const subcategoryPath = (key, slug) => `/category/${key}/${slug}`;

export const belongsToGroup = (group, slug) =>
  group.slugs.includes(slug) || group.prefixes.some((prefix) => slug.startsWith(prefix));

/** Keep only the API categories that belong to `group`, in display order. */
export function pickGroupCategories(group, categories) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const ordered = group.slugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  const extras = categories.filter(
    (category) => !group.slugs.includes(category.slug) && belongsToGroup(group, category.slug),
  );
  return [...ordered, ...extras];
}
