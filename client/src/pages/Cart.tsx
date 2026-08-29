import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShieldCheck, RefreshCw, Award } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  const progressPct = Math.min(100, (cart.subtotal / 10000) * 100);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <h1 className="text-[20px] tracking-wide text-ink mb-8">Your Bag ({cart.itemCount})</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted mb-6">Your bag is empty.</p>
          <Link to="/collections/girls" className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_360px] gap-12">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.sku} className="flex gap-4 pb-6 border-b border-line">
                <div className="w-24 h-28 bg-paper overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[14px] text-ink">{item.name}</div>
                      <div className="text-[12px] text-muted mt-1">
                        {item.color} / {item.size}
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.sku)} className="text-muted hover:text-ink">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-line">
                      <button
                        onClick={() => updateItem(item.sku, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-paper"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateItem(item.sku, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-paper"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-[14px] text-ink">PKR {(item.price * item.qty).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="mb-6">
              <label className="text-[12px] tracking-widest uppercase text-ink block mb-2">Order Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note to your order..."
                rows={2}
                className="w-full border border-line bg-transparent p-3 text-sm outline-none focus:border-clay resize-none"
              />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">Subtotal</span>
                <span className="text-ink">PKR {cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-muted">Shipping</span>
                <span className="text-ink">{cart.shipping === 0 ? "Free" : `PKR ${cart.shipping.toLocaleString()}`}</span>
              </div>
            </div>

            {cart.freeShippingRemaining > 0 && (
              <div className="mb-6">
                <div className="text-[12px] text-muted mb-2">
                  You are PKR {cart.freeShippingRemaining.toLocaleString()} away from FREE SHIPPING
                </div>
                <div className="h-1.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-clay" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-espresso text-cream py-4 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors mb-3"
            >
              Checkout
            </button>
            <Link to="/collections/girls" className="block text-center text-[12px] text-clay underline underline-offset-2 mb-8">
              Continue Shopping
            </Link>

            <div className="grid grid-cols-3 gap-3 text-center text-[11px] text-muted">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck size={16} className="text-clay" /> Secure Payment
              </div>
              <div className="flex flex-col items-center gap-2">
                <RefreshCw size={16} className="text-clay" /> Easy Returns 15 Days
              </div>
              <div className="flex flex-col items-center gap-2">
                <Award size={16} className="text-clay" /> Quality Assured
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
