const Task = require("../models/Task");

const activeReminders = new Map();

/**
 * Schedule or update a reminder for a task
 * @param {Object} task - The mongoose task document or plain object
 */
const scheduleReminder = (task) => {
    if (!task || !task._id) return;

    const taskId = task._id.toString();

    // Cancel any existing reminder for this task first
    cancelReminder(taskId);

    // If task is completed, we don't schedule a reminder
    if (task.status === "completed") {
        console.log(
            `[Reminder Service] Task "${task.title}" is completed. Reminder cancelled.`
        );
        return;
    }

    // If there is no due date, we don't schedule a reminder
    if (!task.dueDate) {
        return;
    }

    const dueDate = new Date(task.dueDate);

    // Fire reminder 1 hour before due date
    const reminderTime = dueDate.getTime() - (60 * 60 * 1000);

    const delay = reminderTime - Date.now();

    console.log("\n========== Reminder Debug ==========");
    console.log("Task Title:", task.title);
    console.log("Task ID:", task._id.toString());
    console.log("Current Time:", new Date().toLocaleTimeString());
    console.log("Due Time:", dueDate.toLocaleTimeString());
    console.log("Reminder Delay:", delay, "ms");
    console.log("===================================\n");

    // If due date is in the future, schedule the reminder
    if (delay > 0) {
        console.log(`[Reminder Service] Scheduling reminder for task "${task.title}" (ID: ${taskId}) in ${(delay / 1000).toFixed(1)} seconds.`);
        const timeoutId = setTimeout(() => {
            console.log(`🔔 [REMINDER]
                Task "${task.title}" is due in 1 hour.
                Description: ${task.description || "No description"}
                Due Date: ${dueDate.toLocaleString()}
                User ID: ${task.userId}
                Task ID: ${taskId}
                `);
            activeReminders.delete(taskId);
        }, delay);

        activeReminders.set(taskId, timeoutId);
        console.log("Remaining Active Reminders:", activeReminders.size);
    }
    else if (delay <= 0) {
        console.log(`
            [Reminder Service] Reminder not scheduled because the reminder time (1 hour before due date) has already passed for task "${task.title}".`
        );
        return;
    }
    else {
        console.log(`[Reminder Service] Task "${task.title}" (ID: ${taskId}) has a due date in the past (${dueDate.toISOString()}). No reminder scheduled.`);
    }


};

/**
 * Cancel a scheduled reminder
 * @param {string} taskId - The ID of the task
 */
const cancelReminder = (taskId) => {
    if (!taskId) return;
    const idStr = taskId.toString();
    if (activeReminders.has(idStr)) {
        console.log(`[Reminder Service] Cancelling reminder for task (ID: ${idStr}).`);
        clearTimeout(activeReminders.get(idStr));
        activeReminders.delete(idStr);
    }
};

/**
 * Initialize reminder service, scheduling reminders for all active tasks with future due dates
 */
const init = async () => {
    try {
        console.log("[Reminder Service] Initializing reminders...");
        // Find all pending tasks with a due date in the future
        const now = new Date();
        const tasks = await Task.find({
            status: "pending",
            dueDate: { $gt: now }
        });

        console.log(`[Reminder Service] Found ${tasks.length} pending task(s) with future due dates. Scheduling...`);
        for (const task of tasks) {
            scheduleReminder(task);
        }
        console.log("[Reminder Service] Initialization complete.");
    } catch (error) {
        console.error("[Reminder Service] Error initializing reminder service:", error);
    }
};

module.exports = {
    scheduleReminder,
    cancelReminder,
    init,
    activeReminders
};
