const Task = require("../models/Task");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const reminderService = require("../services/reminderservice");
const Category = require("../models/Category");
const webhookService = require("../services/webhookService");

// ── Helper: validate a MongoDB ObjectId and call next if invalid ──
const validateObjectId = (id, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        next(new AppError("Invalid Task ID", 400));
        return false;
    }
    return true;
};
//  Create task
const createTask = async (req, res, next) => {
    try {
        const { title, description, dueDate, status, category, tags } = req.body;

        // PostgreSQL returns ids as strings; cast to Number for MongoDB Number fields
        const userId = Number(req.user.id);

        // Validate Category
        if (category) {
            const exists = await Category.findOne({
                _id: category,
                createdBy: userId,
            });
            if (!exists) {
                return next(new AppError("Category not found", 404));
            }
        }

        // Normalise tags — trim whitespace and remove blank entries
        const normalisedTags = Array.isArray(tags)
            ? tags.map((t) => t.trim()).filter(Boolean)
            : [];

        const task = await Task.create({
            title,
            description,
            dueDate,
            status,
            category: category || null,
            tags: normalisedTags,
            userId,
        });

        // Schedule simulated reminder
        reminderService.scheduleReminder(task);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task,
        });

    } catch (error) {
        next(error);
    }
};

// ── Get all tasks for the logged-in user
const getAllTasks = async (req, res, next) => {
    try {

        const tasks = await Task.find({ userId: Number(req.user.id) }).populate("category", "name");

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });

    } catch (error) {
        next(error);
    }
};

// ── Get a single task by ID 
const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const task = await Task.findOne({
            _id: id,
            userId: Number(req.user.id),
        }).populate("category", "name");

        if (!task) {
            return next(new AppError("Task not found", 404));
        }

        res.status(200).json({ success: true, task });

    } catch (error) {
        next(error);
    }
};

// ── Update a task
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const task = await Task.findOne({
            _id: id,
            userId: Number(req.user.id),
        });

        if (!task) {
            return next(new AppError("Task not found", 404));
        }

        // Check if the status changes from pending to completed
        const isStatusChangingToCompleted =
            task.status === "pending" && req.body.status === "completed";

        const allowedFields = ["title", "description", "dueDate", "status", "category"];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        // Handle tags separately so an empty array is still accepted
        if (req.body.tags !== undefined) {
            task.tags = Array.isArray(req.body.tags)
                ? req.body.tags.map((t) => t.trim()).filter(Boolean)
                : task.tags;
        }

        await task.save();

        // Update/Reschedule scheduled reminder
        reminderService.scheduleReminder(task);

        // If status changed from pending to completed, trigger the webhook
        if (isStatusChangingToCompleted) {
            webhookService.sendTaskCompleted(task);
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task,
        });

    } catch (error) {
        next(error);
    }
};

// ── Delete a task 
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const task = await Task.findOneAndDelete({
            _id: id,
            userId: Number(req.user.id),
        });

        if (!task) {
            return next(new AppError("Task not found", 404));
        }

        // Cancel scheduled reminder
        reminderService.cancelReminder(id);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });

    } catch (error) {
        next(error);
    }
};


const filterTasks = async (req, res, next) => {
    try {

        const { category, tag } = req.query;

        // Base query: only logged-in user's tasks
        const query = {
            userId: req.user.id,
        };

        // Filter by category
        if (category) {

            if (!mongoose.Types.ObjectId.isValid(category)) {
                return next(new AppError("Invalid Category ID", 400));
            }

            query.category = category;
        }

        // Filter by tags
        if (tag) {

            // Supports:
            // ?tag=Bug Fix
            // ?tag=Bug Fix,High Priority

            const tags = tag.split(",").map(t => t.trim());

            query.tags = {
                $in: tags
            };
        }

        const tasks = await Task.find(query)
            .populate("category", "name");

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    filterTasks,
};
