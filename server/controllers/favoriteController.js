const Favorite = require("../models/Favorite");
const PG = require("../models/PG");

// POST /api/favorites/:pgId (student only)
async function addFavorite(req, res, next) {
  try {
    const { pgId } = req.params;

    const pg = await PG.findById(pgId);
    if (!pg) return res.status(404).json({ success: false, message: "PG not found" });

    const existing = await Favorite.findOne({ student: req.user._id, pg: pgId });
    if (existing) {
      return res.status(409).json({ success: false, message: "Already in your favorites" });
    }

    await Favorite.create({ student: req.user._id, pg: pgId });
    res.status(201).json({ success: true, message: "Added to favorites" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/favorites/:pgId (student only)
async function removeFavorite(req, res, next) {
  try {
    const result = await Favorite.findOneAndDelete({ student: req.user._id, pg: req.params.pgId });
    if (!result) {
      return res.status(404).json({ success: false, message: "Not in your favorites" });
    }
    res.json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    next(err);
  }
}

// GET /api/favorites (student only)
async function getFavorites(req, res, next) {
  try {
    const favorites = await Favorite.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate("pg");

    // Filter out any favorites whose PG was deleted since being saved
    const pgs = favorites.filter((f) => f.pg).map((f) => f.pg);

    res.json({ success: true, count: pgs.length, pgs });
  } catch (err) {
    next(err);
  }
}

module.exports = { addFavorite, removeFavorite, getFavorites };
