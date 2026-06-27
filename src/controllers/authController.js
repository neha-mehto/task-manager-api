const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");

const {
    createUser,
    findUserByEmail,
} = require("../models/user");

// ── Register ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return next(new AppError("Email already exists", 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(email, hashedPassword);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        next(error);
    }
};

// ── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Step 1: Find user by email
        const user = await findUserByEmail(email);

        if (!user) {
            return next(new AppError("Invalid email or password", 401));
        }

        // Step 2: Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(new AppError("Invalid email or password", 401));
        }

        // Step 3: Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // Step 4: Return token
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
};