# Task Manager API

A secure, modular RESTful API for managing tasks. This system is backed by a hybrid database strategy: **PostgreSQL** handles user accounts and authentication, while **MongoDB** manages user-specific tasks and categories. It also ships with a built-in **reminder notification system** and an **outbound webhook integration** for external service connectivity.

---

## 1. Features

(i). Dual Databases - PostgreSQL stores user accounts; MongoDB stores tasks and categories.
(ii). User Authentication - Register, Login, and JWT token-based route protection.
(iii). Task CRUD - Create, read, update, and delete tasks with full ownership enforcement.
(iv). Advanced Task Fields - Tasks support optional `category` (linked document), `tags` (string array), and `dueDate`.
(v). Task Filtering - Filter tasks by category ID and/or one or more tag values via query parameters.
(vi). Category Management - Full CRUD for user-owned task categories with per-user uniqueness enforcement.
(vii). Real-Time Reminders - In-process scheduler fires a console notification 1 hour before a task's due date. Reminders are created, rescheduled, and cancelled automatically as tasks change. All pending future tasks are restored on server startup.
(viii). Webhook Integration - When a task status changes from `pending` → `completed`, a `task.completed` event payload is POSTed to the configured `WEBHOOK_URL` with automatic retry and exponential backoff (up to 3 attempts).
(ix). Server-Side Validation - Rich body and query parameter validation via `express-validator` (email format, ISO 8601 dates, MongoDB ID checks, tag array shapes, etc.).
(x). Centralized Error Handling - Global error middleware maps database violations, validation errors, and auth failures to clean, consistent JSON responses.

---

## 2. Technologies Used

Runtime - Node.js v25.1.0
Framework - Express.js ^5.2.1
MongoDB ODM - Mongoose  ^9.7.2 
PostgreSQL Client - pg ^8.22.0
Validation - express-validator ^7.3.2
Authentication - jsonwebtoken, bcryptjs
HTTP Client (Webhooks) - axios ^1.18.1 
Job Queue - bullmq ^5.79.2 
Redis Client - ioredis ^5.11.1 
Cron Scheduling - node-cron ^4.5.0 
ID Generation - uuid ^14.0.1 
Monitoring & Dev - morgan, cors, nodemon

---

## 3. Folder Structure

```
task-manager-api/
├── src/
│   ├── config/                  # Database pool & clients
│   │   ├── mongodb.js           # MongoDB connection script
│   │   └── postgres.js          # PostgreSQL pg Pool client
│   ├── controllers/             # Request handling & flow logic
│   │   ├── authController.js
│   │   ├── categoryController.js# NEW — Category CRUD
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/              # Express route middlewares
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorMiddleware.js   # 404 & Global error handlers
│   │   └── validate.js         # Shared validator runner
│   ├── models/                  # Schema & queries
│   │   ├── Category.js          # NEW — Mongoose Category schema
│   │   ├── Task.js              # Mongoose Task schema (+ category & tags fields)
│   │   └── user.js              # PostgreSQL user queries
│   ├── routes/                  # Express Router definitions
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js    # NEW — Category routes
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── services/                # NEW — Background & external services
│   │   ├── reminderservice.js   # In-process task reminder scheduler
│   │   └── webhookService.js    # Outbound webhook with retry logic
│   ├── utils/                   # App helper utilities
│   │   └── AppError.js          # Custom error wrapper
│   ├── validations/             # Validation rules
│   │   ├── authValidations.js
│   │   └── taskValidation.js    # Updated — category & tags rules added
│   ├── app.js                   # Express application base
│   └── server.js                # Server entry & startup logic
├── .env                         # Local environment settings
├── .gitignore                   # Excluded file list
├── package.json
└── package-lock.json
```

---

## 4. Installation

1. Clone or copy the repository files.
2. Open your terminal in the project root directory.
3. Install dependencies:
   ```bash
   npm install
   ```

---

## 5. Environment Variables

Create a `.env` file at the root of the project with the following configuration:

```env
PORT=5000
JWT_SECRET=mySuperSecretKey

# PostgreSQL Config
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres321
POSTGRES_DB=taskmanager

# MongoDB Config
MONGO_URI=mongodb://localhost:27017/taskmanager

# Webhook URL — receives task.completed event payloads
# Can point to any analytics, notification, or automation endpoint
WEBHOOK_URL=https://webhook.site/your-unique-url
```

> **Note:** `WEBHOOK_URL` is optional. If omitted, webhook delivery is silently skipped and a warning is logged.

---

## 6. Database Setup

### (i) PostgreSQL — User Authentication Store

Ensure PostgreSQL is running, then log in and run:

```sql
CREATE DATABASE taskmanager;

\c taskmanager;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### (ii) MongoDB — Task & Category Store

Ensure MongoDB is running locally on port `27017` with a database named `taskmanager`. All collections (`tasks`, `categories`) are created automatically by the Mongoose schemas on first use.

---

## 7. Run Project

### Development Mode
Runs the server with Nodemon (auto-reloads on file changes):
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

On startup, the server will:
1. Verify the PostgreSQL connection.
2. Connect to MongoDB.
3. **Initialize the reminder service** — queries all pending tasks with future due dates and re-schedules their reminders automatically.

---

## 8. API Documentation

All protected routes require the `Authorization: Bearer <JWT_TOKEN>` header.

---

### (i) Authentication Routes

| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT token |

**Register / Login body:**
```json
{ "email": "user@example.com", "password": "securepassword" }
```

---

### (ii) User Routes (Protected)

| `GET` | `/api/users/profile` | Fetch the current logged-in user's profile |

---

### (iii) Task Routes (Protected)


| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks` | Retrieve all tasks for the logged-in user |
| `GET` | `/api/tasks/filter` | Filter tasks by category and/or tags |
| `GET` | `/api/tasks/:id` | Retrieve a single task by MongoDB ID |
| `PATCH` | `/api/tasks/:id` | Update a task (owners only) |
| `DELETE` | `/api/tasks/:id` | Delete a task (owners only) |

**Create / Update task body fields:**

| `title` | `string` | Yes (on create) | Non-empty |
| `description` | `string` | No | Free text |
| `dueDate` | `string` | No | ISO 8601 format |
| `status` | `string` | No | `"pending"` or `"completed"` |
| `category` | `string` | No | Valid MongoDB ObjectId — must belong to the user |
| `tags` | `string[]` | No | Array of non-empty strings |

**Filter tasks — query parameters:**

| `category` | `string` | `?category=<categoryId>` | MongoDB ObjectId |
| `tag` | `string` | `?tag=urgent` or `?tag=urgent,backend` | Comma-separated for multiple tags |

> Setting a task status to `"completed"` automatically **cancels its pending reminder** and **triggers the outbound webhook**.

---

### (iv) Category Routes (Protected)

| `POST` | `/api/categories` | Create a new category |
| `GET` | `/api/categories` | Retrieve all categories for the logged-in user |
| `GET` | `/api/categories/:id` | Retrieve a single category by ID |
| `PUT` | `/api/categories/:id` | Update a category name |
| `DELETE` | `/api/categories/:id` | Delete a category |

**Create / Update category body:**
```json
{ "name": "Work" }
```

> Category names are unique **per user** — the same name cannot be created twice for the same account.

---

## 9. Services

### Reminder Service (`src/services/reminderservice.js`)

An in-process notification system that schedules time-based reminders using Node.js `setTimeout`.

**Behaviour:**
- A reminder fires a detailed console notification **1 hour before** a task's `dueDate`.
- Reminders are **automatically scheduled** when a task is created.
- Reminders are **rescheduled** when a task is updated (e.g., due date or status changed).
- Reminders are **cancelled** when a task is marked `completed` or deleted.
- On server startup, `reminderService.init()` re-schedules reminders for all existing pending tasks with future due dates.

---

### Webhook Service (`src/services/webhookService.js`)

An outbound HTTP integration that notifies external services when a task is completed.

**Event triggered:** `task.completed` — fires when a task's status transitions from `pending` → `completed`.

**Payload sent to `WEBHOOK_URL`:**
```json
{
  "event": "task.completed",
  "timestamp": "2026-06-30T16:30:00.000Z",
  "completionDate": "2026-06-30T16:30:00.000Z",
  "task": {
    "id": "6a3fb22b78cc350e69ea0ba0",
    "title": "Review PRs",
    "description": "Check task controller",
    "status": "completed",
    "dueDate": "2026-06-30T12:00:00.000Z",
    "category": "6a3fb22b78cc350e69ea0ba1",
    "tags": ["urgent", "backend"],
    "userId": 1
  }
}
```

**Retry logic:** Up to **3 automatic retries** with **exponential backoff** (1 s → 2 s → 4 s). Failure is logged without crashing the server. Delivery runs **asynchronously** (fire-and-forget) so the API response is never delayed.

---

## 10. Sample Responses

### (i) Registration Success (`POST /api/auth/register`)
**Status:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "developer@example.com"
  }
}
```

### (ii) Login Success (`POST /api/auth/login`)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

### (iii) Task Creation Success (`POST /api/tasks`)
**Status:** `201 Created`
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "6a3fb22b78cc350e69ea0ba0",
    "title": "Review PRs",
    "description": "Check task controller",
    "status": "pending",
    "dueDate": "2026-06-30T12:00:00.000Z",
    "category": "6a3fb22b78cc350e69ea0ba1",
    "tags": ["urgent", "backend"],
    "userId": 1,
    "createdAt": "2026-06-27T11:21:15.790Z",
    "updatedAt": "2026-06-27T11:21:15.790Z"
  }
}
```

### (iv) Task Update — Status Completed (`PATCH /api/tasks/:id`)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "_id": "6a3fb22b78cc350e69ea0ba0",
    "title": "Review PRs",
    "description": "Check task controller",
    "status": "completed",
    "dueDate": "2026-06-30T12:00:00.000Z",
    "category": { "_id": "6a3fb22b78cc350e69ea0ba1", "name": "Work" },
    "tags": ["urgent", "backend"],
    "userId": 1,
    "createdAt": "2026-06-27T11:21:15.790Z",
    "updatedAt": "2026-06-27T11:25:00.123Z"
  }
}
```

> A `task.completed` webhook is fired asynchronously when status changes to `"completed"`.

### (v) Filter Tasks (`GET /api/tasks/filter?tag=urgent,backend`)
**Status:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "tasks": [
    {
      "_id": "6a3fb22b78cc350e69ea0ba0",
      "title": "Review PRs",
      "status": "pending",
      "tags": ["urgent", "backend"],
      "category": { "_id": "6a3fb22b78cc350e69ea0ba1", "name": "Work" },
      "userId": 1
    }
  ]
}
```

### (vi) Category Creation Success (`POST /api/categories`)
**Status:** `201 Created`
```json
{
  "success": true,
  "category": {
    "_id": "6a3fb22b78cc350e69ea0ba1",
    "name": "Work",
    "createdBy": 1,
    "createdAt": "2026-06-27T11:00:00.000Z",
    "updatedAt": "2026-06-27T11:00:00.000Z"
  }
}
```

### (vii) Validation Error Response
**Status:** `400 Bad Request`
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalidemail",
      "msg": "Please enter a valid email address",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "value": "123",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

### (viii) Task Not Found
**Status:** `404 Not Found`
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Task not found"
}
```

### (ix) All Tasks View (`GET /api/tasks`)
**Status:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "tasks": [
    {
      "_id": "6a3fb22b78cc350e69ea0ba0",
      "title": "Review PRs",
      "description": "Check task controller",
      "status": "pending",
      "dueDate": "2026-06-30T12:00:00.000Z",
      "category": { "_id": "6a3fb22b78cc350e69ea0ba1", "name": "Work" },
      "tags": ["urgent", "backend"],
      "userId": 1,
      "createdAt": "2026-06-27T11:21:15.790Z",
      "updatedAt": "2026-06-27T11:21:15.790Z"
    }
  ]
}
```

### (x) Task Deletion Success (`DELETE /api/tasks/:id`)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```
