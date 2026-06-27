const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Shared middleware that reads express-validator results and passes any
 * validation errors to the global error handler as a 400 AppError.
 *
 * Usage: place after any validation chain in a route definition.
 *   router.post("/", [rules], validate, controller);
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Pass through the global error handler so the response format stays
        // consistent with every other error in the API.
        return next(new AppError("Validation failed", 400, errors.array()));
    }

    next();
};

module.exports = validate;
