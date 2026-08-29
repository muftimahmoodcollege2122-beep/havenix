import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.post("/checkout", async (req, res) => {
  const { cartId, items, subtotal, shipping, contact, address } = req.body as {
    cartId?: string;
    items: { sku: string; name: string; color: string; size: string; price: number; qty: number; image: string }[];
    subtotal: number;
    shipping: number;
    contact: { email: string; fullName: string; phone?: string };
    address: { country?: string; fullAddress: string; apartment?: string; city: string; postalCode?: string };
  };

  if (!items || !items.length) return res.status(400).json({ error: "Cart is empty" });
  if (!contact?.email || !contact?.fullName) return res.status(400).json({ error: "Contact info required" });
  if (!address?.fullAddress || !address?.city) return res.status(400).json({ error: "Delivery address required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify stock and lock rows
    for (const item of items) {
      const { rows } = await client.query(
        "SELECT inventory FROM product_variants WHERE sku = $1 FOR UPDATE",
        [item.sku]
      );
      if (!rows[0] || rows[0].inventory < item.qty) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Insufficient inventory for ${item.name}` });
      }
    }

    const orderId = `HV-${Math.floor(10000 + Math.random() * 89999)}`;
    const total = subtotal + shipping;
    const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const trackingNumber = String(Math.floor(1000000000 + Math.random() * 8999999999));

    await client.query(
      `INSERT INTO orders (id, status, contact_email, contact_name, contact_phone,
         delivery_country, delivery_address, delivery_apartment, delivery_city, delivery_postal_code,
         subtotal, shipping, total, tracking_number, estimated_delivery)
       VALUES ($1,'Processing',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        orderId,
        contact.email,
        contact.fullName,
        contact.phone || null,
        address.country || null,
        address.fullAddress,
        address.apartment || null,
        address.city,
        address.postalCode || null,
        subtotal,
        shipping,
        total,
        trackingNumber,
        estimatedDelivery,
      ]
    );

    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, sku, name, color, size, price, qty, image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [orderId, item.sku, item.name, item.color, item.size, item.price, item.qty, item.image]
      );
      await client.query("UPDATE product_variants SET inventory = inventory - $1 WHERE sku = $2", [
        item.qty,
        item.sku,
      ]);
    }

    if (cartId) {
      await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      orderId,
      status: "Order Placed",
      placedOn: new Date().toISOString().slice(0, 10),
      estimatedDelivery,
      trackingNumber,
      total,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    client.release();
  }
});

export default router;
