const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, required: true },
    roomType: { type: String, required: true },

    moveInDate: { type: Date, required: true },
    stayDurationMonths: { type: Number, required: true, min: 1 },
    occupants: { type: Number, required: true, min: 1, default: 1 },
    message: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
