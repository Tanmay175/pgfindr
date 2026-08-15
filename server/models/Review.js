const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true },
  },
  { timestamps: true }
);

// One review per completed booking, not per student-per-pg, so repeat stays can be reviewed again
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
