const express = require("express");

const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ── API routes 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);

// ── Health check 
app.get("/", (req, res) => {
    res.json({ success: true, message: "Task Manager API Running" });
});

// ── 404 handler — must come after all valid routes ──
app.use(notFound);

// ── Global error handler — must be the very last middleware ──
app.use(errorHandler);

module.exports = app;