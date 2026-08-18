const express = require("express");
const router = express.Router();
const { createReview } = require("../controllers/reviewController");
const { protect, requireStudent } = require("../middleware/auth");
const { reviewRules, handleValidation } = require("../middleware/validators");

router.post("/", protect, requireStudent, reviewRules, handleValidation, createReview);

module.exports = router;
