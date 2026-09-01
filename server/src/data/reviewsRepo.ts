import { pool } from "../db/pool";

export interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  customerName: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  isOwn?: boolean;
}

/** Public, approved reviews for a product — newest first, own review (if any) pinned to top. */
export async function listReviews(productId: string, requestingCustomerId?: string): Promise<ReviewRow[]> {
  const { rows } = await pool.query(
    `SELECT
       r.id, r.rating, r.title, r.body, r.created_at AS "createdAt", r.updated_at AS "updatedAt",
       c.name AS "customerName",
       r.customer_id = $2 AS "isOwn",
       EXISTS (
         SELECT 1 FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN product_variants pv ON pv.sku = oi.sku
         WHERE o.customer_id = r.customer_id
           AND pv.product_id = r.product_id
           AND o.payment_status = 'paid'
       ) AS "verifiedPurchase"
     FROM reviews r
     JOIN customers c ON c.id = r.customer_id
     WHERE r.product_id = $1 AND r.is_approved = true
     ORDER BY (r.customer_id = $2) DESC, r.created_at DESC`,
    [productId, requestingCustomerId || null]
  );
  return rows;
}

export async function getRatingSummary(productId: string) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS "reviewCount", COALESCE(AVG(rating), 0)::float AS "rating"
     FROM reviews WHERE product_id = $1 AND is_approved = true`,
    [productId]
  );
  return rows[0] as { reviewCount: number; rating: number };
}

export async function getOwnReview(productId: string, customerId: string): Promise<ReviewRow | null> {
  const { rows } = await pool.query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at AS "createdAt", r.updated_at AS "updatedAt", c.name AS "customerName"
     FROM reviews r JOIN customers c ON c.id = r.customer_id
     WHERE r.product_id = $1 AND r.customer_id = $2`,
    [productId, customerId]
  );
  return rows[0] || null;
}

interface UpsertReviewInput {
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  body?: string;
}

/** One review per customer per product — resubmitting edits the existing one. */
export async function upsertReview(input: UpsertReviewInput) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (product_id, customer_id, rating, title, body, is_approved)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (customer_id, product_id) DO UPDATE
       SET rating = EXCLUDED.rating, title = EXCLUDED.title, body = EXCLUDED.body, updated_at = now()
     RETURNING id`,
    [input.productId, input.customerId, input.rating, input.title || null, input.body || null]
  );
  return rows[0].id as string;
}

export async function deleteReview(reviewId: string, customerId: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM reviews WHERE id = $1 AND customer_id = $2", [
    reviewId,
    customerId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function getProductIdBySlug(slug: string): Promise<string | null> {
  const { rows } = await pool.query("SELECT id FROM products WHERE slug = $1", [slug]);
  return rows[0]?.id || null;
}
