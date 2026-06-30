const axios = require("axios");

console.log("Webhook URL:", process.env.WEBHOOK_URL);

/**
 * Sends a POST request to the configured WEBHOOK_URL.
 * Implements retry logic with exponential backoff.
 * 
 * @param {string} url - Webhook endpoint URL
 * @param {object} payload - Data to send
 * @param {number} retries - Number of retries left (defaults to 3)
 * @param {number} delay - Current delay in milliseconds before retry (defaults to 1000ms)
 */
const sendWebhookWithRetry = async (url, payload, retries = 3, delay = 1000) => {
    try {
        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 5000, // 5 seconds timeout
        });

        console.log(`[Webhook Service] Successfully delivered webhook to ${url}. Status: ${response.status}`);
        return true;
    } catch (error) {
        const errorMessage = error.response
            ? `Status Code: ${error.response.status}`
            : error.message;

        console.error(`[Webhook Service] Failed to send webhook to ${url}. Error: ${errorMessage}`);

        if (retries > 0) {
            console.log(`[Webhook Service] Retrying in ${delay}ms... (${retries} attempts left)`);

            // Wait for backoff delay then retry
            await new Promise((resolve) => setTimeout(resolve, delay));
            return sendWebhookWithRetry(url, payload, retries - 1, delay * 2);
        } else {
            console.error(`[Webhook Service] Max retries reached. Webhook delivery failed for task ID: ${payload.task?.id || payload.task?._id}`);
            return false;
        }
    }
};

/**
 * Triggers task completed webhook notification.
 * 
 * @param {object} task - The task object that was completed
 */
const sendTaskCompleted = (task) => {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("[Webhook Service] Warning: WEBHOOK_URL is not defined in .env. Skipping webhook execution.");
        return;
    }

    const payload = {
        event: "task.completed",
        timestamp: new Date().toISOString(),
        completionDate: new Date().toISOString(),
        task: {
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status,
            dueDate: task.dueDate,
            category: task.category,
            tags: task.tags,
            userId: task.userId,
        },
    };

    console.log(`[Webhook Service] Triggering task.completed webhook for task "${task.title}" (ID: ${task._id})`);

    // Fire and forget, execution runs asynchronously in background
    sendWebhookWithRetry(webhookUrl, payload);
};

module.exports = {
    sendTaskCompleted,
};