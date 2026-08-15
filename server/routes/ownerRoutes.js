const express = require("express");
const router = express.Router();
const { getOwnerPGs, getOwnerStats, getOwnerBookings, approveBooking, rejectBooking } = require("../controllers/ownerController");
const { protect, requireOwner } = require("../middleware/auth");

router.use(protect, requireOwner);

router.get("/pgs", getOwnerPGs);
router.get("/stats", getOwnerStats);
router.get("/bookings", getOwnerBookings);
router.put("/bookings/:id/approve", approveBooking);
router.put("/bookings/:id/reject", rejectBooking);

module.exports = router;
