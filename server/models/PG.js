const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["single", "double", "triple", "four_sharing"],
      required: true,
    },
    totalRooms: { type: Number, required: true, min: 0 },
    availableRooms: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const pgSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    pgType: { type: String, enum: ["boys", "girls", "coed"], required: true },
    gender: { type: String, enum: ["male", "female", "any"], required: true },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, trim: true, index: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      lat: { type: Number },
      lng: { type: Number },
      nearbyCollege: { type: String, trim: true },
      nearbyLandmark: { type: String, trim: true },
    },

    pricing: {
      securityDeposit: { type: Number, default: 0 },
      maintenanceCharge: { type: Number, default: 0 },
      electricityCharge: { type: Number, default: 0 },
      waterCharge: { type: Number, default: 0 },
      otherCharges: { type: Number, default: 0 },
    },

    rooms: [roomSchema],

    amenities: [{ type: String, trim: true }],

    rules: {
      foodAvailable: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      alcoholAllowed: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
      visitorsAllowed: { type: Boolean, default: true },
      curfewTime: { type: String, default: "" },
      noticePeriodDays: { type: Number, default: 0 },
      minimumStayMonths: { type: Number, default: 1 },
      otherRules: { type: String, default: "" },
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isCover: { type: Boolean, default: false },
      },
    ],

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

pgSchema.index({ "location.city": 1, "pricing.securityDeposit": 1 });
pgSchema.index({ name: "text", "location.city": "text", "location.nearbyCollege": "text" });

// Lowest room price for quick sort/filter without aggregation on every query
pgSchema.virtual("minPrice").get(function () {
  if (!this.rooms || this.rooms.length === 0) return 0;
  return Math.min(...this.rooms.map((r) => r.price));
});
pgSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("PG", pgSchema);
