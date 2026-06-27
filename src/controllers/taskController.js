const Task = require("../models/task");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

// ── Helper: validate a MongoDB ObjectId and call next if invalid ────────────
const validateObjectId = (id, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        next(new AppError("Invalid Task ID", 400));
        return false;
    }
    return true;
};

// ── Create task ─────────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
    try {
        const { title, description, dueDate, status } = req.body;

        const task = await Task.create({
            title,
            description,
            dueDate,
            status,
            userId: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task,
        });

    } catch (error) {
        next(error);
    }
};

// ── Get all tasks for the logged-in user ────────────────────────────────────
const getAllTasks = async (req, res, next) => {
    try {

        const tasks = await Task.find({ userId: req.user.id });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });

    } catch (error) {
        next(error);
    }
};

// ── Get a single task by ID ─────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const task = await Task.findOne({
            _id: id,
            userId: req.user.id,
        });

        if (!task) {
            return next(new AppError("Task not found", 404));
        }

        res.status(200).json({ success: true, task });

    } catch (error) {
        next(error);
    }
};

// ── Update a task ───────────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const task = await Task.findOne({
            _id: id,
            userId: req.user.id,
        });

        if (!task) {
            return next(new AppError("Task not found", 404));
        }

        const allowedFields = ["title", "description", "dueDate", "status"];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        await task.save();

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task,
        });

    } catch (error) {
        next(error);
    }
};

// ── Delete a task ───────────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id, next)) return;

        const task = await Task.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        if (!task) {
            return next(new AppError("Task not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
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
};
