const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);

module.exports = router;
