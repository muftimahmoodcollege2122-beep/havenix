import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, RefreshCw, MessageCircle, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getCartId } from "../context/CartContext";
import { api } from "../lib/api";

const STEPS = ["Bag", "Contact", "Delivery", "Payment", "Review"];

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [contact, setContact] = useState({ email: "", fullName: "", phone: "", newsletter: false });
  const [address, setAddress] = useState({ country: "Pakistan", fullAddress: "", apartment: "", city: "", postalCode: "" });
  const [payment, setPayment] = useState({ method: "card", cardNumber: "", expiry: "", cvv: "" });

  if (cart.items.length === 0 && !placing) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-24 text-center">
        <p className="text-muted mb-6">Your bag is empty. Add items before checking out.</p>
        <button onClick={() => navigate("/collections/girls")} className="bg-espresso text-cream px-7 py-3.5 text-[13px] tracking-widest uppercase">
          Continue Shopping
        </button>
      </div>
    );
  }

  const goNext = () => {
    setErrorMsg("");
    if (step === 2 && (!contact.email || !contact.fullName)) {
      setErrorMsg("Please enter your email and full name.");
      return;
    }
    if (step === 3 && (!address.fullAddress || !address.city)) {
      setErrorMsg("Please enter your delivery address and city.");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const placeOrder = async () => {
    setPlacing(true);
    setErrorMsg("");
    try {
      const result: any = await api.checkout({
        cartId: getCartId(),
        items: cart.items,
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        contact,
        address,
      });
      await refresh();
      navigate(`/orders/${result.orderId}`, { state: result });
    } catch (e: any) {
      setErrorMsg(e.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] ${
                i + 1 <= step ? "bg-espresso text-cream" : "bg-line text-muted"
              }`}
            >
              {i + 1 < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-[11px] tracking-widest uppercase ${i + 1 === step ? "text-ink" : "text-muted"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-line" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-12">
        <div>
          {errorMsg && <div className="text-rose text-sm mb-4">{errorMsg}</div>}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-[16px] tracking-wide text-ink mb-4">Contact Information</h2>
              <p className="text-[12px] text-muted -mt-3">
                Already have an account? <span className="text-clay underline underline-offset-2 cursor-pointer">Login</span>
              </p>
              <Field label="Email address" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} type="email" />
              <label className="flex items-center gap-2 text-[12px] text-muted">
                <input
                  type="checkbox"
                  checked={contact.newsletter}
                  onChange={(e) => setContact({ ...contact, newsletter: e.target.checked })}
                  className="accent-clay"
                />
                Email me with news and offers
              </label>
              <Field label="Full Name" value={contact.fullName} onChange={(v) => setContact({ ...contact, fullName: v })} />
              <Field label="Phone Number" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-[16px] tracking-wide text-ink mb-4">Delivery Address</h2>
              <div>
                <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Country/Region</label>
                <select
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full border border-line bg-transparent p-3 text-sm outline-none focus:border-clay"
                >
                  <option>Pakistan</option>
                  <option>United Arab Emirates</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                </select>
              </div>
              <Field label="Full Address" value={address.fullAddress} onChange={(v) => setAddress({ ...address, fullAddress: v })} />
              <Field label="Apartment, suite, etc. (optional)" value={address.apartment} onChange={(v) => setAddress({ ...address, apartment: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                <Field label="Postal Code" value={address.postalCode} onChange={(v) => setAddress({ ...address, postalCode: v })} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-[16px] tracking-wide text-ink mb-4">Payment</h2>
              <div className="flex gap-3 mb-2">
                {["card", "cod"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment({ ...payment, method: m })}
                    className={`px-5 py-2.5 text-[12px] tracking-wide border ${
                      payment.method === m ? "border-espresso bg-espresso text-cream" : "border-line text-ink"
                    }`}
                  >
                    {m === "card" ? "Credit / Debit Card" : "Cash on Delivery"}
                  </button>
                ))}
              </div>
              {payment.method === "card" && (
                <>
                  <Field label="Card Number" value={payment.cardNumber} onChange={(v) => setPayment({ ...payment, cardNumber: v })} placeholder="1234 1234 1234 1234" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" value={payment.expiry} onChange={(v) => setPayment({ ...payment, expiry: v })} placeholder="MM/YY" />
                    <Field label="CVV" value={payment.cvv} onChange={(v) => setPayment({ ...payment, cvv: v })} placeholder="123" />
                  </div>
                </>
              )}
              {payment.method === "cod" && <p className="text-[13px] text-muted">Pay with cash when your order arrives.</p>}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-[16px] tracking-wide text-ink mb-4">Review Your Order</h2>
              <ReviewRow label="Contact" value={`${contact.fullName} · ${contact.email}`} />
              <ReviewRow label="Deliver to" value={`${address.fullAddress}, ${address.city}, ${address.country}`} />
              <ReviewRow label="Payment" value={payment.method === "card" ? "Credit / Debit Card" : "Cash on Delivery"} />
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-espresso text-cream py-4 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          )}

          {step < 5 && (
            <button
              onClick={goNext}
              className="mt-8 w-full md:w-auto bg-espresso text-cream px-10 py-4 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors"
            >
              Continue to {STEPS[step]}
            </button>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-paper p-6 h-fit">
          <h3 className="text-[13px] tracking-widest uppercase text-ink mb-5">Order Summary</h3>
          <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.sku} className="flex gap-3">
                <div className="w-14 h-16 bg-cream overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-ink">{item.name}</div>
                  <div className="text-[11px] text-muted">
                    {item.color} / {item.size}
                  </div>
                </div>
                <div className="text-[13px] text-ink">PKR {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-line text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink">PKR {cart.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="text-ink">{step >= 3 ? (cart.shipping === 0 ? "Free" : `PKR ${cart.shipping.toLocaleString()}`) : "Calculated at next step"}</span>
            </div>
            <div className="flex justify-between text-[15px] pt-2 border-t border-line">
              <span className="text-ink">Total</span>
              <span className="text-ink">PKR {(cart.subtotal + (step >= 3 ? cart.shipping : 0)).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[12px] text-muted">
            <div className="flex items-start gap-2">
              <ShieldCheck size={15} className="text-clay mt-0.5" />
              <div>
                <div className="text-ink">Secure Checkout</div>
                Your payment is 100% secure
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RefreshCw size={15} className="text-clay mt-0.5" />
              <div>
                <div className="text-ink">Easy Returns</div>
                15 days return policy
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageCircle size={15} className="text-clay mt-0.5" />
              <div>
                <div className="text-ink">Need Help?</div>
                WhatsApp us anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line bg-transparent p-3 text-sm outline-none focus:border-clay"
      />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px] border-b border-line pb-3">
      <span className="text-muted">{label}</span>
      <span className="text-ink text-right max-w-[60%]">{value}</span>
    </div>
  );
}
