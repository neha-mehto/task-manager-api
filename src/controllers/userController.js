const { findUserById } = require("../models/user");
const AppError = require("../utils/AppError");

const getProfile = async (req, res, next) => {
    try {

        const user = await findUserById(req.user.id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({ success: true, user });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
};