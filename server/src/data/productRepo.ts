import { pool } from "../db/pool";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  compareAtPrice: number | null;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  hasRealReviews: boolean;
  description: string;
  material: string;
  care: string;
  sizeRange: string;
  images: string[];
  variants: {
    sku: string;
    color: string;
    colorHex: string;
    size: string;
    inventory: number;
  }[];
}

export const PRODUCT_SELECT = `
  SELECT
    p.id, p.slug, p.name, p.category, p.sub_category AS "subCategory",
    p.price, p.compare_at_price AS "compareAtPrice", p.is_new AS "isNew",
    COALESCE(rv.review_count, 0) > 0 AS "hasRealReviews",
    CASE WHEN COALESCE(rv.review_count, 0) > 0 THEN rv.avg_rating ELSE p.rating::float END AS rating,
    CASE WHEN COALESCE(rv.review_count, 0) > 0 THEN rv.review_count ELSE p.review_count END AS "reviewCount",
    p.description, p.material, p.care, p.size_range AS "sizeRange",
    COALESCE(
      (SELECT json_agg(pi.url ORDER BY pi.position) FROM product_images pi WHERE pi.product_id = p.id),
      '[]'
    ) AS images,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'sku', pv.sku, 'color', pv.color, 'colorHex', pv.color_hex,
        'size', pv.size, 'inventory', pv.inventory
      )) FROM product_variants pv WHERE pv.product_id = p.id),
      '[]'
    ) AS variants
  FROM products p
  LEFT JOIN (
    SELECT product_id, COUNT(*)::int AS review_count, AVG(rating)::float AS avg_rating
    FROM reviews WHERE is_approved = true
    GROUP BY product_id
  ) rv ON rv.product_id = p.id
`;

export async function listProducts(category?: string, sort?: string): Promise<ProductRow[]> {
  const params: any[] = [];
  let query = PRODUCT_SELECT;
  if (category) {
    params.push(category);
    query += ` WHERE p.category = $${params.length}`;
  }
  if (sort === "price-asc") query += " ORDER BY p.price ASC";
  else if (sort === "price-desc") query += " ORDER BY p.price DESC";
  else query += " ORDER BY p.created_at DESC";
  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const { rows } = await pool.query(`${PRODUCT_SELECT} WHERE p.slug = $1`, [slug]);
  return rows[0] || null;
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4): Promise<ProductRow[]> {
  const { rows } = await pool.query(
    `${PRODUCT_SELECT} WHERE p.category = $1 AND p.id != $2 ORDER BY p.created_at DESC LIMIT $3`,
    [category, excludeId, limit]
  );
  return rows;
}

export async function searchProducts(q: string): Promise<ProductRow[]> {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const conditions = terms
    .map((_, i) => `(lower(p.name) LIKE $${i + 1} OR lower(p.category) LIKE $${i + 1} OR lower(p.sub_category) LIKE $${i + 1})`)
    .join(" OR ");
  const params = terms.map((t) => `%${t}%`);
  const { rows } = await pool.query(`${PRODUCT_SELECT} WHERE ${conditions}`, params);
  return rows;
}

export async function getVariantBySku(sku: string) {
  const { rows } = await pool.query(
    `SELECT pv.*, p.id AS product_id, p.name, p.price, p.category,
       (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image
     FROM product_variants pv JOIN products p ON p.id = pv.product_id
     WHERE pv.sku = $1`,
    [sku]
  );
  return rows[0] || null;
}
