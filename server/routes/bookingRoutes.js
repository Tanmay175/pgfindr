const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, requireStudent } = require("../middleware/auth");

router.post("/", protect, requireStudent, createBooking);
router.get("/my", protect, requireStudent, getMyBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/cancel", protect, requireStudent, cancelBooking);

module.exports = router;
