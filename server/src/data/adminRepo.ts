import { pool } from "../db/pool";
import { PRODUCT_SELECT, ProductRow } from "./productRepo";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "product";
  let n = 1;
  while (true) {
    const { rows } = await pool.query(
      excludeId
        ? "SELECT id FROM products WHERE slug = $1 AND id != $2"
        : "SELECT id FROM products WHERE slug = $1",
      excludeId ? [slug, excludeId] : [slug]
    );
    if (rows.length === 0) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export interface ProductInput {
  name: string;
  category: string;
  subCategory: string;
  price: number;
  compareAtPrice?: number | null;
  isNew?: boolean;
  description?: string;
  material?: string;
  care?: string;
  sizeRange?: string;
  images: string[];
  variants: {
    sku: string;
    color: string;
    colorHex: string;
    size: string;
    inventory: number;
  }[];
}

export async function listAllProductsAdmin(): Promise<ProductRow[]> {
  const { rows } = await pool.query(`${PRODUCT_SELECT} ORDER BY p.created_at DESC`);
  return rows;
}

export async function createProduct(input: ProductInput): Promise<ProductRow> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const slug = await uniqueSlug(slugify(input.name));
    const { rows } = await client.query(
      `INSERT INTO products
        (slug, name, category, sub_category, price, compare_at_price, is_new, description, material, care, size_range)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        slug,
        input.name,
        input.category,
        input.subCategory,
        input.price,
        input.compareAtPrice ?? null,
        input.isNew ?? true,
        input.description ?? "",
        input.material ?? "",
        input.care ?? "",
        input.sizeRange ?? "",
      ]
    );
    const productId = rows[0].id;

    for (let i = 0; i < input.images.length; i++) {
      await client.query(
        `INSERT INTO product_images (product_id, url, position) VALUES ($1,$2,$3)`,
        [productId, input.images[i], i]
      );
    }

    for (const v of input.variants) {
      await client.query(
        `INSERT INTO product_variants (product_id, sku, color, color_hex, size, inventory)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [productId, v.sku, v.color, v.colorHex, v.size, v.inventory]
      );
    }

    await client.query("COMMIT");
    const { rows: full } = await client.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [productId]);
    return full[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductRow | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: existing } = await client.query("SELECT slug FROM products WHERE id = $1", [id]);
    if (existing.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE products SET
        name = $1, category = $2, sub_category = $3, price = $4, compare_at_price = $5,
        is_new = $6, description = $7, material = $8, care = $9, size_range = $10
       WHERE id = $11`,
      [
        input.name,
        input.category,
        input.subCategory,
        input.price,
        input.compareAtPrice ?? null,
        input.isNew ?? true,
        input.description ?? "",
        input.material ?? "",
        input.care ?? "",
        input.sizeRange ?? "",
        id,
      ]
    );

    await client.query("DELETE FROM product_images WHERE product_id = $1", [id]);
    for (let i = 0; i < input.images.length; i++) {
      await client.query(
        `INSERT INTO product_images (product_id, url, position) VALUES ($1,$2,$3)`,
        [id, input.images[i], i]
      );
    }

    await client.query("DELETE FROM product_variants WHERE product_id = $1", [id]);
    for (const v of input.variants) {
      await client.query(
        `INSERT INTO product_variants (product_id, sku, color, color_hex, size, inventory)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, v.sku, v.color, v.colorHex, v.size, v.inventory]
      );
    }

    await client.query("COMMIT");
    const { rows: full } = await client.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
    return full[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}

export async function updateVariantInventory(sku: string, inventory: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    "UPDATE product_variants SET inventory = $1 WHERE sku = $2",
    [inventory, sku]
  );
  return (rowCount ?? 0) > 0;
}
