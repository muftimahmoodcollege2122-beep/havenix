"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { ReviewsResponse, Review } from "@/lib/types";

function StarRow({
  rating,
  size = 14,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = interactive ? hover || rating : rating;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined}
        >
          <Star size={size} className={n <= active ? "fill-clay text-clay" : "text-line"} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete }: { review: Review; onDelete?: () => void }) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StarRow rating={review.rating} />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] text-ink font-medium">{review.customerName}</span>
            {review.verifiedPurchase && (
              <span className="flex items-center gap-1 text-[11px] text-clay">
                <ShieldCheck size={12} /> Verified Purchase
              </span>
            )}
            {review.isOwn && <span className="text-[11px] text-muted">(You)</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">
            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {review.isOwn && onDelete && (
            <button onClick={onDelete} className="text-[11px] text-muted hover:text-rose transition-colors underline underline-offset-2">
              Delete
            </button>
          )}
        </div>
      </div>
      {review.title && <div className="text-[13px] text-ink font-medium mt-2">{review.title}</div>}
      {review.body && <p className="text-[13px] text-muted leading-relaxed mt-1">{review.body}</p>}
    </div>
  );
}

export default function ProductReviews({ slug }: { slug: string }) {
  const { customer } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .getReviews(slug)
      .then((d) => setData(d as ReviewsResponse))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, customer?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.submitReview(slug, { rating, title: title.trim() || undefined, body: body.trim() || undefined });
      setFormOpen(false);
      setRating(0);
      setTitle("");
      setBody("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteReview(id);
      load();
    } catch {
      // silent — review list will just still show it; user can retry
    }
  };

  if (loading) {
    return <div className="py-6 flex justify-center text-muted"><Loader2 size={18} className="animate-spin" /></div>;
  }
  if (!data) {
    return <p className="text-[13px] text-muted py-4">Couldn't load reviews right now.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <StarRow rating={Math.round(data.summary.rating)} size={16} />
          <span className="text-[13px] text-ink">
            {data.summary.rating > 0 ? data.summary.rating.toFixed(1) : "No ratings yet"}
            {data.summary.reviewCount > 0 && <span className="text-muted"> · {data.summary.reviewCount} review{data.summary.reviewCount === 1 ? "" : "s"}</span>}
          </span>
        </div>
        {customer ? (
          data.canReview && !formOpen && (
            <button onClick={() => setFormOpen(true)} className="text-[12px] text-clay underline underline-offset-2">
              Write a Review
            </button>
          )
        ) : (
          <Link href={`/login?redirect=/products/${slug}`} className="text-[12px] text-clay underline underline-offset-2">
            Log in to write a review
          </Link>
        )}
      </div>

      {formOpen && (
        <form onSubmit={submit} className="bg-paper p-5 rounded-sm mb-6 space-y-4">
          <div>
            <label className="text-[11px] tracking-widest uppercase text-muted block mb-2">Your Rating</label>
            <StarRow rating={rating} size={22} interactive onChange={setRating} />
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Sum up your experience"
              className="w-full border border-line bg-cream p-2.5 text-sm outline-none focus:border-clay"
            />
          </div>
          <div>
            <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Review (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="What did you like or dislike?"
              className="w-full border border-line bg-cream p-2.5 text-sm outline-none focus:border-clay resize-none"
            />
          </div>
          {error && <p className="text-rose text-[12px]">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-espresso text-cream px-6 py-2.5 text-[12px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-[12px] text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {data.reviews.length === 0 ? (
        <p className="text-[13px] text-muted py-4">
          No reviews yet. {customer ? "Be the first to share your thoughts." : "Log in to be the first to review this product."}
        </p>
      ) : (
        <div>
          {data.reviews.map((r) => (
            <ReviewCard key={r.id} review={r} onDelete={r.isOwn ? () => remove(r.id) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
