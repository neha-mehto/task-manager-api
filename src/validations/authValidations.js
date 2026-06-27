const { body } = require("express-validator");
const validate = require("../middleware/validate");

// ── Rules: POST /api/auth/register ─────────────────────────────────────────
const registerValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

// ── Rules: POST /api/auth/login ─────────────────────────────────────────────
const loginValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address"),

    body("password")
        .notEmpty().withMessage("Password is required"),
];

module.exports = {
    registerValidation,
    loginValidation,
    validate,
};
