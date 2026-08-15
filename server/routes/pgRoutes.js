const express = require("express");
const router = express.Router();
const {
  createPG,
  getPGs,
  getPGById,
  updatePG,
  deletePG,
  deletePGImage,
  setCoverImage,
} = require("../controllers/pgController");
const { getPGReviews } = require("../controllers/reviewController");
const { protect, requireOwner } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getPGs);
router.get("/:id", getPGById);
router.get("/:id/reviews", getPGReviews);

router.post("/", protect, requireOwner, upload.array("images", 10), createPG);
router.put("/:id", protect, requireOwner, upload.array("images", 10), updatePG);
router.delete("/:id", protect, requireOwner, deletePG);

router.delete("/:id/images/:imageId", protect, requireOwner, deletePGImage);
router.put("/:id/images/:imageId/cover", protect, requireOwner, setCoverImage);

module.exports = router;
