/**
 * Custom operational error class.
 * Throw this anywhere in the app to send a structured HTTP error
 * through the global error handling middleware.
 *
 * @example
 *   throw new AppError("Task not found", 404);
 *   throw new AppError("Validation failed", 400, [{ field: "email", msg: "..." }]);
 */
class AppError extends Error {
    /**
     * @param {string} message    - Human-readable error message sent to the client.
     * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500 …).
     * @param {Array}  [errors]   - Optional array of field-level validation errors.
     */
    constructor(message, statusCode, errors = null) {
        super(message);

        this.statusCode = statusCode;

        // Distinguish operational (known) errors from unexpected programming bugs
        this.isOperational = true;

        // Attach field-level validation errors when provided
        if (errors) {
            this.errors = errors;
        }

        // Capture a clean stack trace that excludes this constructor frame
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
