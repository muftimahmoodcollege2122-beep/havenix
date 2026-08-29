import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Check, Truck } from "lucide-react";
import { api } from "../lib/api";
import type { Order } from "../types";

const STAGES = ["Order Placed", "Processing", "Packed", "Shipped", "Delivered"];

export default function OrderTracking() {
  const { id = "" } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const justPlaced = (location.state as any)?.orderId === id;

  useEffect(() => {
    if (justPlaced) {
      const s = location.state as any;
      setOrder({
        id: s.orderId,
        placedOn: s.placedOn,
        status: "Processing",
        items: [],
        subtotal: 0,
        shipping: 0,
        total: s.total,
        trackingNumber: s.trackingNumber,
        estimatedDelivery: s.estimatedDelivery,
      });
    } else {
      api.getOrder(id).then((data) => setOrder(data as Order));
    }
  }, [id, justPlaced]);

  if (!order) return <div className="max-w-[1440px] mx-auto px-6 py-20 text-center text-muted">Loading...</div>;

  const currentIndex = STAGES.indexOf(order.status === "Processing" ? "Processing" : order.status);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[20px] tracking-wide text-ink">Order #{order.id}</h1>
        <span className="text-[12px] text-clay">Need help? Contact us</span>
      </div>

      <div className="border border-line rounded-sm p-6 mb-10">
        <div className="text-[12px] text-muted mb-1">Placed on {order.placedOn}</div>
        <div className="flex items-center justify-between mt-6 relative">
          <div className="absolute top-4 left-0 right-0 h-px bg-line" />
          {STAGES.map((stage, i) => (
            <div key={stage} className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] border-2 ${
                  i <= currentIndex ? "bg-espresso border-espresso text-cream" : "bg-cream border-line text-muted"
                }`}
              >
                {i < currentIndex ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] tracking-wide text-center ${i <= currentIndex ? "text-ink" : "text-muted"}`}>
                {stage}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-line">
          <div>
            <div className="text-[12px] text-muted">Estimated Delivery</div>
            <div className="text-[13px] text-ink">{order.estimatedDelivery}</div>
          </div>
          <div>
            <div className="text-[12px] text-muted">Tracking Number</div>
            <div className="text-[13px] text-ink">{order.trackingNumber}</div>
          </div>
          <button className="bg-espresso text-cream px-6 py-3 text-[12px] tracking-widest uppercase flex items-center gap-2 hover:bg-ink transition-colors">
            <Truck size={14} /> Track Package
          </button>
        </div>
      </div>

      {order.items.length > 0 && (
        <>
          <h2 className="text-[13px] tracking-widest uppercase text-ink mb-4">Order Items</h2>
          <div className="border border-line rounded-sm divide-y divide-line mb-10">
            {order.items.map((item) => (
              <div key={item.sku} className="flex items-center gap-4 px-5 py-4">
                <div className="w-14 h-16 bg-paper overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-ink">{item.name}</div>
                  <div className="text-[11px] text-muted">{item.color} / {item.size}</div>
                </div>
                <div className="text-[13px] text-ink">PKR {item.price.toLocaleString()} x{item.qty}</div>
              </div>
            ))}
            <div className="px-5 py-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-ink">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-ink">PKR {order.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[15px] pt-2 border-t border-line">
                <span className="text-ink">Total</span>
                <span className="text-ink">PKR {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-blush/30 rounded-sm p-8 text-center">
        <div className="font-serif text-[18px] text-ink mb-1">Love Your Purchase?</div>
        <p className="text-muted text-[13px] mb-5">We'd love to see your little one in Havenix.</p>
        <button className="bg-espresso text-cream px-7 py-3 text-[12px] tracking-widest uppercase hover:bg-ink transition-colors">
          Share A Photo
        </button>
      </div>
    </div>
  );
}
