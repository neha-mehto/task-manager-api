const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(new AppError("Authorization header missing", 401));
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return next(new AppError("Token missing", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        // jwt.verify throws JsonWebTokenError / TokenExpiredError —
        // pass them to the global handler so it maps them correctly.
        next(error);
    }

};

module.exports = authMiddleware;