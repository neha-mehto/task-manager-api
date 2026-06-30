const Category = require("../models/Category");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

// create category
const createCategory = async (req, res, next) => {

    try {

        const category = await Category.create({

            name: req.body.name,

            createdBy: Number(req.user.id)

        });

        res.status(201).json({

            success: true,

            category

        });

    }

    catch (error) {

        next(error);

    }

};

// Get all categories of logged-in user
const getAllCategories = async (req, res, next) => {
    try {

        const categories = await Category.find({
            createdBy: Number(req.user.id)
        });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        next(error);
    }
};

// Helper: validate a MongoDB ObjectId and call next if invalid
const validateObjectId = (id, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        next(new AppError("Invalid Category ID", 400));
        return false;
    }
    return true;
};

// Get a single category by ID
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const category = await Category.findOne({
            _id: id,
            createdBy: Number(req.user.id)
        });

        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        next(error);
    }
};

// Update a category
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const category = await Category.findOne({
            _id: id,
            createdBy: Number(req.user.id)
        });

        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        if (req.body.name !== undefined) {
            category.name = req.body.name;
        }

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        next(error);
    }
};

// Delete a category
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const category = await Category.findOneAndDelete({
            _id: id,
            createdBy: Number(req.user.id)
        });

        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};