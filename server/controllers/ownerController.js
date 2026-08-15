const mongoose = require("mongoose");
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

// GET /api/owner/bookings — all booking requests across this owner's PGs
async function getOwnerBookings(req, res, next) {
  try {
    const { status } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("student", "name phone email")
      .populate("pg", "name location");

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
}

// PUT /api/owner/bookings/:id/approve
// This is the critical double-booking-safe path: the room's availableRooms
// is decremented atomically and ONLY if it's still > 0 at the moment of the
// update. If two owners' clients (or two rapid clicks) race for the last
// room, only the update that finds availableRooms > 0 will match and
// succeed - the loser gets a clean 409, never a negative room count.
async function approveBooking(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (String(booking.owner) !== String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized to manage this booking" });
    }
    if (booking.status !== "pending") {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: `Cannot approve a booking that is already ${booking.status}` });
    }

    // Atomic conditional decrement - the availableRooms > 0 condition is
    // checked and applied in the same operation, so this is safe under
    // concurrent approval attempts.
    const updateResult = await PG.updateOne(
      { _id: booking.pg, "rooms._id": booking.roomId, "rooms.availableRooms": { $gt: 0 } },
      { $inc: { "rooms.$.availableRooms": -1 } },
      { session }
    );

    if (updateResult.modifiedCount === 0) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: "This room type just became fully booked" });
    }

    booking.status = "approved";
    await booking.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: "Booking approved", booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

// PUT /api/owner/bookings/:id/reject
async function rejectBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (String(booking.owner) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to manage this booking" });
    }
    if (booking.status !== "pending") {
      return res.status(409).json({ success: false, message: `Cannot reject a booking that is already ${booking.status}` });
    }

    booking.status = "rejected";
    await booking.save();

    res.json({ success: true, message: "Booking rejected", booking });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOwnerPGs, getOwnerStats, getOwnerBookings, approveBooking, rejectBooking };
