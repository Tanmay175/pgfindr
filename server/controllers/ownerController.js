const PG = require("../models/PG");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// GET /api/owner/pgs
async function getOwnerPGs(req, res, next) {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: pgs.length, pgs });
  } catch (err) {
    next(err);
  }
}

// GET /api/owner/stats
async function getOwnerStats(req, res, next) {
  try {
    const pgs = await PG.find({ owner: req.user._id });
    const pgIds = pgs.map((p) => p._id);

    const totalRooms = pgs.reduce((sum, p) => sum + p.rooms.reduce((s, r) => s + r.totalRooms, 0), 0);
    const availableRooms = pgs.reduce((sum, p) => sum + p.rooms.reduce((s, r) => s + r.availableRooms, 0), 0);

    const [pendingRequests, approvedBookings, reviews] = await Promise.all([
      Booking.countDocuments({ owner: req.user._id, status: "pending" }),
      Booking.countDocuments({ owner: req.user._id, status: "approved" }),
      Review.find({ pg: { $in: pgIds } }),
    ]);

    const avgRating =
      reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    res.json({
      success: true,
      stats: {
        totalPGs: pgs.length,
        totalRooms,
        availableRooms,
        pendingRequests,
        approvedBookings,
        totalReviews: reviews.length,
        averageRating: Number(avgRating.toFixed(1)),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOwnerPGs, getOwnerStats };
