"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import { api } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await api.submitContact(form);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-10" style={{ animation: "fadeUp 0.5s ease-out both" }}>
        <CheckCircle2 size={36} className="mx-auto text-clay mb-4" />
        <h3 className="font-serif text-[20px] text-ink mb-2">Message Sent</h3>
        <p className="text-muted text-[14px]">
          Thanks for reaching out — we usually reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Subject</label>
        <select
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="input"
        >
          <option value="" disabled>
            Select a topic
          </option>
          <option value="Order Question">Order Question</option>
          <option value="Returns & Exchanges">Returns & Exchanges</option>
          <option value="Product Question">Product Question</option>
          <option value="Wholesale / Press">Wholesale / Press</option>
          <option value="Something Else">Something Else</option>
        </select>
      </div>
      <div>
        <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input resize-none"
        />
      </div>
      {error && <p className="text-rose text-[13px]">{error}</p>}
      <Magnetic>
        <button
          disabled={sending}
          className="bg-espresso text-cream px-8 py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </Magnetic>
    </form>
  );
}
