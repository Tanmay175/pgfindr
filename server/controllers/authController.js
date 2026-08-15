const User = require("../models/User");
const { generateToken, setTokenCookie } = require("../utils/generateToken");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }
    if (!["student", "owner"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, phone, password, role });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out" });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    res.status(200).json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/me (any authenticated user)
async function updateProfile(req, res, next) {
  try {
    const allowedFields = ["name", "phone", "college", "course", "year", "gender", "preferredLocation", "budget"];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Profile updated successfully", user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  return obj;
}

module.exports = { register, login, logout, getMe, updateProfile };
