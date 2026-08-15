const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const PG = require("../models/PG");

// POST /api/bookings (student only)
async function createBooking(req, res, next) {
  try {
    const { pgId, roomId, moveInDate, stayDurationMonths, occupants, message } = req.body;

    if (!pgId || !roomId || !moveInDate || !stayDurationMonths) {
      return res.status(400).json({ success: false, message: "PG, room, move-in date and duration are required" });
    }

    const pg = await PG.findById(pgId);
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });

    const room = pg.rooms.id(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room type not found" });

    if (room.availableRooms <= 0) {
      return res.status(409).json({ success: false, message: "This room type is currently fully booked" });
    }

    const moveIn = new Date(moveInDate);
    if (isNaN(moveIn.getTime()) || moveIn < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "Move-in date must be a valid future date" });
    }
    if (Number(stayDurationMonths) < 1) {
      return res.status(400).json({ success: false, message: "Stay duration must be at least 1 month" });
    }

    // Prevent duplicate pending requests for the same student + room
    const existing = await Booking.findOne({
      student: req.user._id,
      pg: pgId,
      roomId,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "You already have a pending request for this room type" });
    }

    const booking = await Booking.create({
      student: req.user._id,
      pg: pgId,
      owner: pg.owner,
      roomId,
      roomType: room.type,
      moveInDate: moveIn,
      stayDurationMonths: Number(stayDurationMonths),
      occupants: Number(occupants) || 1,
      message,
      status: "pending",
    });

    res.status(201).json({ success: true, message: "Booking request sent", booking });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/my (student only)
async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate("pg", "name location images rooms");
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/:id (owner of booking, either student or PG owner)
async function getBookingById(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate("pg", "name location images");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const isOwnerOfBooking =
      String(booking.student) === String(req.user._id) || String(booking.owner) === String(req.user._id);
    if (!isOwnerOfBooking) {
      return res.status(403).json({ success: false, message: "Not authorized to view this booking" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
}

// PUT /api/bookings/:id/cancel (student only, own booking)
async function cancelBooking(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (String(booking.student) !== String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }
    if (!["pending", "approved"].includes(booking.status)) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: `Cannot cancel a booking that is already ${booking.status}` });
    }

    const wasApproved = booking.status === "approved";
    booking.status = "cancelled";
    await booking.save({ session });

    // If it was already approved, releasing it frees up the room again
    if (wasApproved) {
      await PG.updateOne(
        { _id: booking.pg, "rooms._id": booking.roomId },
        { $inc: { "rooms.$.availableRooms": 1 } },
        { session }
      );
    }

    await session.commitTransaction();
    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
}

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
