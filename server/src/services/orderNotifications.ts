import { pool } from "../db/pool";
import { sendWhatsApp } from "./twilioClient";

interface OrderForNotification {
  id: string;
  contactName: string;
  contactPhone: string | null;
  total: number;
  city: string | null;
  items: { name: string; qty: number }[];
}

async function loadOrder(orderId: string): Promise<OrderForNotification | null> {
  const { rows } = await pool.query(
    `SELECT o.id, o.contact_name AS "contactName", o.contact_phone AS "contactPhone",
            o.total, o.delivery_city AS "city",
            COALESCE(
              (SELECT json_agg(json_build_object('name', oi.name, 'qty', oi.qty)) FROM order_items oi WHERE oi.order_id = o.id),
              '[]'
            ) AS items
     FROM orders o WHERE o.id = $1`,
    [orderId]
  );
  return rows[0] || null;
}

function describeItems(items: { name: string; qty: number }[]): string {
  return items.map((i) => (i.qty > 1 ? `${i.name} (x${i.qty})` : i.name)).join(", ");
}

async function logNotification(params: {
  orderId: string;
  channel: "whatsapp";
  recipient: string;
  body: string;
  sent: boolean;
  skipped: boolean;
  reason?: string;
}) {
  const status = params.sent ? "sent" : params.skipped ? "skipped" : "failed";
  await pool.query(
    `INSERT INTO notifications (order_id, channel, status, recipient, body, sent_at, failure_reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [params.orderId, params.channel, status, params.recipient, params.body, params.sent ? new Date() : null, params.reason || null]
  );
}

/**
 * Fires both notifications for a newly-placed (or newly-paid) order:
 * one to the store owner, one to the customer. Never throws — a
 * notification failure should never fail the order itself, since the
 * order is already committed by the time this runs.
 */
export async function notifyNewOrder(orderId: string): Promise<void> {
  try {
    const order = await loadOrder(orderId);
    if (!order) {
      console.warn(`notifyNewOrder: order ${orderId} not found`);
      return;
    }

    const itemSummary = describeItems(order.items);

    // 1. Alert the store owner.
    const adminPhone = process.env.ADMIN_NOTIFY_PHONE;
    if (adminPhone) {
      const adminMessage =
        `🛍️ New order ${order.id}\n` +
        `${order.contactName} — PKR ${order.total.toLocaleString()}\n` +
        `${itemSummary || "(no items on record)"}\n` +
        (order.city ? `Ship to: ${order.city}` : "");
      const result = await sendWhatsApp(adminPhone, adminMessage);
      await logNotification({
        orderId,
        channel: "whatsapp",
        recipient: adminPhone,
        body: adminMessage,
        sent: result.sent,
        skipped: result.skipped,
        reason: result.reason,
      });
    }

    // 2. Thank the customer, mentioning what they actually bought.
    if (order.contactPhone) {
      const firstName = order.contactName.split(" ")[0];
      const customerMessage =
        `Hi ${firstName}! 💛 Thank you for shopping with Havenix.\n\n` +
        `Your order ${order.id} for ${itemSummary || "your item(s)"} is confirmed and we're getting it ready. ` +
        `We'll send tracking details as soon as it ships.\n\n` +
        `— Team Havenix`;
      const result = await sendWhatsApp(order.contactPhone, customerMessage);
      await logNotification({
        orderId,
        channel: "whatsapp",
        recipient: order.contactPhone,
        body: customerMessage,
        sent: result.sent,
        skipped: result.skipped,
        reason: result.reason,
      });
    }
  } catch (err) {
    // Notifications are best-effort — log and move on.
    console.error(`notifyNewOrder failed for ${orderId}:`, err);
  }
}
