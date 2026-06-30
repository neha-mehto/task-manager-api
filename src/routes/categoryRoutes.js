const express = require("express");

const router = express.Router();

const {

    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,

} = require("../controllers/categoryController");

const auth = require("../middleware/authMiddleware");

router.post("/", auth, createCategory);

router.get("/", auth, getAllCategories);

router.get("/:id", auth, getCategoryById);

router.put("/:id", auth, updateCategory);

router.delete("/:id", auth, deleteCategory);

module.exports = router;