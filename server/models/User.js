const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "owner"], required: true },
    profilePhoto: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    // Student-only fields
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    year: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"], default: undefined },
    preferredLocation: { type: String, trim: true },
    budget: { type: Number },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
