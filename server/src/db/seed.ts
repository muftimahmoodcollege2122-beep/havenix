import { pool } from "./pool";
import { products } from "../data/products";
import { customer, familyProfiles, orders } from "../data/account";

async function seed() {
  // Safe to run on every deploy: only seeds an empty database. Never wipes
  // real data — if products already exist, this is a no-op.
  const { rows: existing } = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  if (existing[0].count > 0) {
    console.log(`Database already has ${existing[0].count} product(s) — skipping seed.`);
    await pool.end();
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Customer
    const custRes = await client.query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id",
      [customer.name, customer.email]
    );
    const customerId = custRes.rows[0].id;

    // Family profiles
    for (const c of familyProfiles) {
      await client.query(
        "INSERT INTO family_profiles (customer_id, name, department, age_years, height_cm, weight_kg) VALUES ($1,$2,$3,$4,$5,$6)",
        [customerId, c.name, c.department, (c as any).ageYears || null, c.heightCm, c.weightKg]
      );
    }

    // Products, images, variants
    const slugToId: Record<string, string> = {};
    for (const p of products) {
      const res = await client.query(
        `INSERT INTO products (slug, name, category, sub_category, price, is_new, rating, review_count, description, material, care, size_range)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [
          p.slug,
          p.name,
          p.category,
          p.subCategory,
          p.price,
          p.isNew,
          p.rating,
          p.reviewCount,
          p.description,
          p.material,
          p.care,
          p.sizeRange,
        ]
      );
      const productId = res.rows[0].id;
      slugToId[p.slug] = productId;

      for (let i = 0; i < p.images.length; i++) {
        await client.query(
          "INSERT INTO product_images (product_id, url, position) VALUES ($1,$2,$3)",
          [productId, p.images[i], i]
        );
      }

      for (const v of p.variants) {
        await client.query(
          "INSERT INTO product_variants (product_id, sku, color, color_hex, size, inventory) VALUES ($1,$2,$3,$4,$5,$6)",
          [productId, v.sku, v.color, v.colorHex, v.size, v.inventory]
        );
      }
    }

    // Orders + order items (attach to seeded customer)
    for (const o of orders) {
      await client.query(
        `INSERT INTO orders (id, customer_id, status, contact_email, contact_name, subtotal, shipping, total, tracking_number, estimated_delivery, placed_on)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          o.id,
          customerId,
          o.status,
          customer.email,
          customer.name,
          o.subtotal,
          o.shipping,
          o.total,
          o.trackingNumber || null,
          o.estimatedDelivery || null,
          o.placedOn,
        ]
      );
      for (const item of o.items) {
        await client.query(
          "INSERT INTO order_items (order_id, sku, name, color, size, price, qty, image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [o.id, item.sku, item.name, item.color, item.size, item.price, item.qty, item.image]
        );
      }
    }

    await client.query("COMMIT");
    console.log(`Seeded ${products.length} products, ${orders.length} orders, ${familyProfiles.length} family profiles.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
