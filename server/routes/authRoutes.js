const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerRules, loginRules, handleValidation } = require("../middleware/validators");

router.post("/register", authLimiter, registerRules, handleValidation, register);
router.post("/login", authLimiter, loginRules, handleValidation, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);

module.exports = router;
