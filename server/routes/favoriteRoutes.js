const express = require("express");
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require("../controllers/favoriteController");
const { protect, requireStudent } = require("../middleware/auth");

router.use(protect, requireStudent);

router.get("/", getFavorites);
router.post("/:pgId", addFavorite);
router.delete("/:pgId", removeFavorite);

module.exports = router;
