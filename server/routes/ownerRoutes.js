const express = require("express");
const router = express.Router();
const { getOwnerPGs, getOwnerStats } = require("../controllers/ownerController");
const { protect, requireOwner } = require("../middleware/auth");

router.use(protect, requireOwner);

router.get("/pgs", getOwnerPGs);
router.get("/stats", getOwnerStats);
// Phase 6: router.get("/bookings", ...); router.put("/bookings/:id/approve", ...); etc.

module.exports = router;
