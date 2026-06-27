const AppError = require("../utils/AppError");


// 404 — catch-all for routes that don't match any registered handler
// Must be placed AFTER all route definitions in app.js

const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Global error handler
// Express identifies error-handling middleware by its 4-argument signature.


const errorHandler = (err, req, res, next) => {

    // ── Clone mutable properties so we don't alter the original error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // ── Mongoose: invalid ObjectId (e.g. GET /tasks/bad-id)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid value for field "${err.path}": ${err.value}`;
    }

    // ── Mongoose: schema validation failed (e.g. missing required field)
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // ── MongoDB: duplicate key (e.g. unique index violation)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {}).join(", ");
        message = `Duplicate value for field: ${field}`;
    }

    // ── JWT: token is structurally invalid
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }

    // ── JWT: token has expired 
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Your session has expired. Please log in again.";
    }

    // ── Log the full error in development; omit stack in production 
    if (process.env.NODE_ENV !== "production") {
        console.error(`[${statusCode}] ${err.name || "Error"}: ${err.message}`);
        if (err.stack) console.error(err.stack);
    } else {
        // Only log unexpected (non-operational) errors in production
        if (!err.isOperational) {
            console.error("UNEXPECTED ERROR:", err);
        }
    }

    // ── Build response
    const response = {
        success: false,
        statusCode,
        message,
    };

    // Forward field-level validation errors when present
    if (err.errors) {
        response.errors = err.errors;
    }

    // Attach stack trace only in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };