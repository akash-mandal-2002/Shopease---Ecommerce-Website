/**
 * Mega-menu content for the header.
 *
 * HOW TO EXTEND
 * -------------
 * - Keys of NAV_MENUS must match the `label` of an item in Header's `nav` array.
 *   A nav item with no entry here (e.g. "Home") simply gets no dropdown.
 * - To add a new menu: add the nav item in Header.jsx, then add an entry below.
 * - To add a subcategory: push `{ label, path }` into the right list.
 *
 * SHAPE
 * -----
 * {
 *   featured: [{ label, path }],            // large links, left column (max ~4)
 *   columns:  [{ title, links: [{ label, path }] }]   // up to 4 columns
 * }
 *
 * Category slugs below are the same ones used by CategorySection / Shop.
 */

import { subcategoryPath } from "../../utils/categoryGroups";

// Subcategory page: header section -> category page -> filtered products.
const sub = (group, slug) => subcategoryPath(group, slug);

// Search shortcut scoped to a category, e.g. /shop?category=groceries&q=rice
const inCategory = (slug, query) =>
  `/shop?category=${slug}&q=${encodeURIComponent(query)}`;

export const NAV_MENUS = {
  Men: {
    featured: [
      { label: "Shirts", path: sub("men", "mens-shirts") },
      { label: "Shoes", path: sub("men", "mens-shoes") },
      { label: "Watches", path: sub("men", "mens-watches") },
    ],
    columns: [
      {
        title: "Accessories",
        links: [
          { label: "Sunglasses", path: sub("men", "sunglasses") },
          { label: "Sports Accessories", path: sub("men", "sports-accessories") },
        ],
      },
      {
        title: "Grooming",
        links: [
          { label: "Fragrances", path: sub("men", "fragrances") },
          { label: "Skin Care", path: sub("men", "skin-care") },
        ],
      },
    ],
  },

  Women: {
    featured: [
      { label: "Dresses", path: sub("women", "womens-dresses") },
      { label: "Tops", path: sub("women", "tops") },
      { label: "Shoes", path: sub("women", "womens-shoes") },
    ],
    columns: [
      {
        title: "Accessories",
        links: [
          { label: "Bags", path: sub("women", "womens-bags") },
          { label: "Jewellery", path: sub("women", "womens-jewellery") },
          { label: "Watches", path: sub("women", "womens-watches") },
          { label: "Sunglasses", path: sub("women", "sunglasses") },
        ],
      },
      {
        title: "Beauty",
        links: [
          { label: "Makeup", path: sub("women", "beauty") },
          { label: "Skin Care", path: sub("women", "skin-care") },
          { label: "Fragrances", path: sub("women", "fragrances") },
        ],
      },
    ],
  },

  Electronics: {
    featured: [
      { label: "Laptops", path: sub("electronics", "laptops") },
      { label: "Smartphones", path: sub("electronics", "smartphones") },
      { label: "Tablets", path: sub("electronics", "tablets") },
    ],
    columns: [
      {
        title: "Accessories",
        links: [{ label: "Mobile Accessories", path: sub("electronics", "mobile-accessories") }],
      },
    ],
  },

  Beauty: {
    featured: [
      { label: "Makeup", path: sub("beauty", "beauty") },
      { label: "Skin Care", path: sub("beauty", "skin-care") },
      { label: "Fragrances", path: sub("beauty", "fragrances") },
    ],
    columns: [
      {
        title: "Finish the look",
        links: [
          { label: "Sunglasses", path: sub("women", "sunglasses") },
          { label: "Jewellery", path: sub("women", "womens-jewellery") },
          { label: "Bags", path: sub("women", "womens-bags") },
        ],
      },
    ],
  },

  Groceries: {
    featured: [{ label: "All Groceries", path: sub("groceries", "groceries") }],
    columns: [
      {
        title: "Pantry",
        links: [
          { label: "Rice", path: inCategory("groceries", "rice") },
          { label: "Honey", path: inCategory("groceries", "honey") },
          { label: "Cooking Oil", path: inCategory("groceries", "oil") },
        ],
      },
      {
        title: "Dairy & Eggs",
        links: [
          { label: "Milk", path: inCategory("groceries", "milk") },
          { label: "Eggs", path: inCategory("groceries", "eggs") },
          { label: "Ice Cream", path: inCategory("groceries", "ice cream") },
        ],
      },
      {
        title: "Drinks",
        links: [
          { label: "Juice", path: inCategory("groceries", "juice") },
          { label: "Coffee", path: inCategory("groceries", "coffee") },
          { label: "Tea", path: inCategory("groceries", "tea") },
        ],
      },
      {
        title: "Kitchen & Home",
        links: [
          { label: "Kitchen Accessories", path: sub("groceries", "kitchen-accessories") },
          { label: "Home Decoration", path: sub("groceries", "home-decoration") },
        ],
      },
    ],
  },
};

/** Small utility links shown at the bottom-right of every desktop dropdown. */
export const MENU_FOOTER_LINKS = [
  { label: "All products", path: "/shop" },
  { label: "Wishlist", path: "/wishlist" },
  { label: "Orders", path: "/orders" },
];