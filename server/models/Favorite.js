const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ student: 1, pg: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
