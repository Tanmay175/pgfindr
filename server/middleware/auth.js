const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT from HTTP-only cookie (or Bearer header as fallback) and attaches req.user
async function protect(req, res, next) {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

function requireStudent(req, res, next) {
  if (req.user?.role !== "student") {
    return res.status(403).json({ success: false, message: "Students only" });
  }
  next();
}

function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ success: false, message: "PG owners only" });
  }
  next();
}

module.exports = { protect, requireStudent, requireOwner };
