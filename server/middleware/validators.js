const { body, validationResult } = require("express-validator");

// Runs after any validation chain - returns a clean 400 with all messages
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(", "),
    });
  }
  next();
}

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).trim().matches(/^[0-9+\-\s()]{7,15}$/).withMessage("Invalid phone number"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => value === req.body.password).withMessage("Passwords do not match"),
  body("role").isIn(["student", "owner"]).withMessage("Role must be student or owner"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const bookingRules = [
  body("pgId").isMongoId().withMessage("Invalid PG"),
  body("roomId").isMongoId().withMessage("Invalid room"),
  body("moveInDate").isISO8601().withMessage("Valid move-in date is required"),
  body("stayDurationMonths").isInt({ min: 1 }).withMessage("Stay duration must be at least 1 month"),
  body("occupants").optional().isInt({ min: 1 }).withMessage("Occupants must be at least 1"),
  body("message").optional({ checkFalsy: true }).isLength({ max: 500 }).withMessage("Message is too long"),
];

const reviewRules = [
  body("bookingId").isMongoId().withMessage("Invalid booking"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("review").optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage("Review is too long"),
];

module.exports = { handleValidation, registerRules, loginRules, bookingRules, reviewRules };
