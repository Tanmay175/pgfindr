const Review = require("../models/Review");
const Booking = require("../models/Booking");
const PG = require("../models/PG");

async function recalculatePGRating(pgId) {
  const reviews = await Review.find({ pg: pgId });
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await PG.findByIdAndUpdate(pgId, {
    "rating.average": Number(average.toFixed(1)),
    "rating.count": count,
  });
}

// POST /api/reviews (student only)
// Reviewable once a booking has been approved and the move-in date has
// passed (i.e. the stay has actually started) - or is marked completed.
async function createReview(req, res, next) {
  try {
    const { bookingId, rating, review } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: "Booking and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (String(booking.student) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to review this booking" });
    }

    const stayStarted = booking.status === "completed" ||
      (booking.status === "approved" && new Date(booking.moveInDate) <= new Date());
    if (!stayStarted) {
      return res.status(409).json({ success: false, message: "You can only review a PG after your stay has started" });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already reviewed this booking" });
    }

    const created = await Review.create({
      student: req.user._id,
      pg: booking.pg,
      booking: bookingId,
      rating,
      review,
    });

    await recalculatePGRating(booking.pg);

    res.status(201).json({ success: true, message: "Review submitted", review: created });
  } catch (err) {
    next(err);
  }
}

// GET /api/pgs/:id/reviews
async function getPGReviews(req, res, next) {
  try {
    const reviews = await Review.find({ pg: req.params.id })
      .sort({ createdAt: -1 })
      .populate("student", "name");
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, getPGReviews };
