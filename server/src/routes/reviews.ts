import { Router } from "express";
import { requireCustomer, optionalCustomer } from "../middleware/customerAuth";
import {
  listReviews,
  getRatingSummary,
  getOwnReview,
  upsertReview,
  deleteReview,
  getProductIdBySlug,
} from "../data/reviewsRepo";

const router = Router();

router.get("/products/:slug/reviews", optionalCustomer, async (req, res) => {
  try {
    const productId = await getProductIdBySlug(req.params.slug as string);
    if (!productId) return res.status(404).json({ error: "Product not found" });

    const [reviews, summary, ownReview] = await Promise.all([
      listReviews(productId, req.customerId),
      getRatingSummary(productId),
      req.customerId ? getOwnReview(productId, req.customerId) : Promise.resolve(null),
    ]);

    res.json({ reviews, summary, ownReview, canReview: !!req.customerId && !ownReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

router.post("/products/:slug/reviews", requireCustomer, async (req, res) => {
  try {
    const productId = await getProductIdBySlug(req.params.slug as string);
    if (!productId) return res.status(404).json({ error: "Product not found" });

    const { rating, title, body } = req.body as { rating: number; title?: string; body?: string };
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a whole number from 1 to 5." });
    }
    if (title && title.length > 120) {
      return res.status(400).json({ error: "Title is too long (120 characters max)." });
    }
    if (body && body.length > 2000) {
      return res.status(400).json({ error: "Review is too long (2000 characters max)." });
    }

    const reviewId = await upsertReview({
      productId,
      customerId: req.customerId!,
      rating,
      title: title?.trim(),
      body: body?.trim(),
    });

    res.status(201).json({ id: reviewId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.delete("/reviews/:id", requireCustomer, async (req, res) => {
  try {
    const deleted = await deleteReview(req.params.id as string, req.customerId!);
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
