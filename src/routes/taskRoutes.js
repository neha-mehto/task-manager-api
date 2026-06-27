const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
} = require("../controllers/taskController");

const {
    createTaskValidation,
    updateTaskValidation,
    validate,
} = require("../validations/taskValidation");

router.post("/", authMiddleware, ...createTaskValidation, validate, createTask);
router.get("/", authMiddleware, getAllTasks);
router.get("/:id", authMiddleware, getTaskById);
router.patch("/:id", authMiddleware, ...updateTaskValidation, validate, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;