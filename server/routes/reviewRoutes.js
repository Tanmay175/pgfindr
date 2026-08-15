const express = require("express");
const router = express.Router();
const { createReview } = require("../controllers/reviewController");
const { protect, requireStudent } = require("../middleware/auth");

router.post("/", protect, requireStudent, createReview);

module.exports = router;
