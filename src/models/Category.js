const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        createdBy: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Compound index to ensure uniqueness of category name per user
categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);