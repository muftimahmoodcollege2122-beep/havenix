import { pool } from "../db/pool";

export interface CheckoutItemInput {
  sku: string;
  qty: number;
}

/** Re-prices items server-side from the DB — never trust client-sent prices. */
export async function priceItems(items: CheckoutItemInput[]) {
  if (items.length === 0) return { lines: [], subtotal: 0 };

  const skus = items.map((i) => i.sku);
  const { rows } = await pool.query(
    `SELECT pv.sku, pv.color, pv.size, pv.inventory, p.id AS "productId", p.name, p.price,
       (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image
     FROM product_variants pv JOIN products p ON p.id = pv.product_id
     WHERE pv.sku = ANY($1::text[])`,
    [skus]
  );

  const bySku = new Map(rows.map((r) => [r.sku, r]));
  const lines = items.map((item) => {
    const variant = bySku.get(item.sku);
    if (!variant) throw new Error(`Unknown SKU: ${item.sku}`);
    return {
      sku: item.sku,
      qty: item.qty,
      name: variant.name,
      color: variant.color,
      size: variant.size,
      price: variant.price,
      image: variant.image,
      inventory: variant.inventory,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  return { lines, subtotal };
}

export function computeShipping(subtotal: number) {
  return subtotal >= 10000 || subtotal === 0 ? 0 : 700;
}

interface CreatePendingOrderInput {
  contact: { email: string; fullName: string; phone?: string };
  address: { country?: string; fullAddress: string; apartment?: string; city: string; postalCode?: string };
  method: string;
  lines: Awaited<ReturnType<typeof priceItems>>["lines"];
  subtotal: number;
  shipping: number;
}

/** Creates an order in 'unpaid' state — stock is NOT decremented until payment is confirmed. */
export async function createPendingOrder(input: CreatePendingOrderInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderId = `HV-${Math.floor(10000 + Math.random() * 89999)}`;
    const total = input.subtotal + input.shipping;

    await client.query(
      `INSERT INTO orders (id, status, contact_email, contact_name, contact_phone,
         delivery_country, delivery_address, delivery_apartment, delivery_city, delivery_postal_code,
         subtotal, shipping, total, payment_status, payment_method)
       VALUES ($1,'Processing',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'unpaid',$13)`,
      [
        orderId,
        input.contact.email,
        input.contact.fullName,
        input.contact.phone || null,
        input.address.country || null,
        input.address.fullAddress,
        input.address.apartment || null,
        input.address.city,
        input.address.postalCode || null,
        input.subtotal,
        input.shipping,
        total,
        input.method,
      ]
    );

    for (const line of input.lines) {
      await client.query(
        "INSERT INTO order_items (order_id, sku, name, color, size, price, qty, image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [orderId, line.sku, line.name, line.color, line.size, line.price, line.qty, line.image]
      );
    }

    const paymentRes = await client.query(
      `INSERT INTO payments (order_id, amount, currency, status, provider) VALUES ($1,$2,'PKR','pending',$3) RETURNING id`,
      [orderId, total, input.method]
    );
    const paymentId = paymentRes.rows[0].id;

    await client.query("COMMIT");
    return { orderId, paymentId, total };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function recordCheckoutAttempt(paymentId: string, reference: string) {
  await pool.query(
    `INSERT INTO payment_transactions (payment_id, type, amount, provider_reference, status)
     SELECT $1, 'charge', amount, $2, 'pending' FROM payments WHERE id = $1`,
    [paymentId, reference]
  );
}

export async function findOrderByReference(reference: string) {
  const { rows } = await pool.query(
    `SELECT p.id AS "paymentId", p.order_id AS "orderId", p.status AS "paymentStatus"
     FROM payment_transactions pt
     JOIN payments p ON p.id = pt.payment_id
     WHERE pt.provider_reference = $1
     ORDER BY pt.created_at DESC LIMIT 1`,
    [reference]
  );
  return rows[0] || null;
}

/**
 * Idempotent: safe to call multiple times for the same order (gateways retry
 * webhooks). Only the first successful call actually decrements inventory.
 */
export async function finalizeOrderPayment(orderId: string, providerTransactionId?: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: orderRows } = await client.query(
      "SELECT payment_status FROM orders WHERE id = $1 FOR UPDATE",
      [orderId]
    );
    if (!orderRows[0]) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "Order not found" };
    }
    if (orderRows[0].payment_status === "paid") {
      await client.query("ROLLBACK");
      return { ok: true, alreadyProcessed: true };
    }

    const { rows: items } = await client.query(
      "SELECT sku, qty FROM order_items WHERE order_id = $1",
      [orderId]
    );

    for (const item of items) {
      const { rows: variantRows } = await client.query(
        "SELECT inventory FROM product_variants WHERE sku = $1 FOR UPDATE",
        [item.sku]
      );
      if (!variantRows[0] || variantRows[0].inventory < item.qty) {
        await client.query("ROLLBACK");
        return { ok: false, reason: `Insufficient inventory for ${item.sku}` };
      }
    }

    for (const item of items) {
      await client.query("UPDATE product_variants SET inventory = inventory - $1 WHERE sku = $2", [
        item.qty,
        item.sku,
      ]);
    }

    const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const trackingNumber = String(Math.floor(1000000000 + Math.random() * 8999999999));

    await client.query(
      `UPDATE orders SET payment_status = 'paid', tracking_number = $2, estimated_delivery = $3 WHERE id = $1`,
      [orderId, trackingNumber, estimatedDelivery]
    );
    await client.query(`UPDATE payments SET status = 'paid' WHERE order_id = $1`, [orderId]);
    await client.query(
      `UPDATE payment_transactions SET status = 'success' WHERE payment_id = (SELECT id FROM payments WHERE order_id = $1)`,
      [orderId]
    );

    await client.query("COMMIT");
    return { ok: true, trackingNumber, estimatedDelivery };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function failOrderPayment(orderId: string) {
  await pool.query(
    `UPDATE orders SET payment_status = 'failed' WHERE id = $1 AND payment_status = 'unpaid'`,
    [orderId]
  );
  await pool.query(`UPDATE payments SET status = 'failed' WHERE order_id = $1 AND status = 'pending'`, [orderId]);
  await pool.query(
    `UPDATE payment_transactions SET status = 'failed' WHERE payment_id = (SELECT id FROM payments WHERE order_id = $1) AND status = 'pending'`,
    [orderId]
  );
}

export async function getOrderPaymentStatus(orderId: string) {
  const { rows } = await pool.query(
    `SELECT id, status AS "orderStatus", payment_status AS "paymentStatus", total, tracking_number AS "trackingNumber"
     FROM orders WHERE id = $1`,
    [orderId]
  );
  return rows[0] || null;
}

export async function clearCart(cartId?: string) {
  if (!cartId) return;
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
}
