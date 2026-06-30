const { body } = require("express-validator");
const validate = require("../middleware/validate");

// ── Rules: POST /api/tasks ──────────────────────────────────────────────────
const createTaskValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required"),

    body("description")
        .optional()
        .trim(),

    body("status")
        .optional()
        .isIn(["pending", "completed"])
        .withMessage("Status must be 'pending' or 'completed'"),

    body("dueDate")
        .optional()
        .isISO8601().withMessage("Due date must be a valid ISO 8601 date (e.g. 2025-12-31)")
        .toDate(),

    body("category")
        .optional({ nullable: true })
        .isMongoId().withMessage("Category must be a valid ID"),

    body("tags")
        .optional()
        .isArray().withMessage("Tags must be an array"),

    body("tags.*")
        .optional()
        .isString().withMessage("Each tag must be a string")
        .trim()
        .notEmpty().withMessage("Tags cannot contain empty strings"),
];

// ── Rules: PATCH /api/tasks/:id ─────────────────────────────────────────────
const updateTaskValidation = [
    body("title")
        .optional()
        .trim()
        .notEmpty().withMessage("Title cannot be empty"),

    body("description")
        .optional()
        .trim(),

    body("status")
        .optional()
        .isIn(["pending", "completed"])
        .withMessage("Status must be 'pending' or 'completed'"),

    body("dueDate")
        .optional()
        .isISO8601().withMessage("Due date must be a valid ISO 8601 date (e.g. 2025-12-31)")
        .toDate(),

    body("category")
        .optional({ nullable: true })
        .isMongoId().withMessage("Category must be a valid ID"),

    body("tags")
        .optional()
        .isArray().withMessage("Tags must be an array"),

    body("tags.*")
        .optional()
        .isString().withMessage("Each tag must be a string")
        .trim()
        .notEmpty().withMessage("Tags cannot contain empty strings"),
];

module.exports = {
    createTaskValidation,
    updateTaskValidation,
    validate,
};
