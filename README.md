Title: Task Manager API

A secure, modular RESTful API for managing tasks. This system is backed by a hybrid database strategy: **PostgreSQL** handles user accounts and authentication, while **MongoDB** manages user-specific tasks.

---

1. Features
(i). Dual Databases: Secure user authentication storage in PostgreSQL and flexible task document storage in MongoDB.
(ii). User Authentication: Register, Login, and JWT Token-based protection.
(iii). Task CRUD: Create, read, update, and delete tasks under complete user ownership.
(iv). Server-Side Validation: Rich query and body parameter checking (e.g., email format, required fields, ISO 8601 due dates).
(v). Centralized Error Handling: Clean, consistent global error mapping for database violations, validation errors, and authentication failures.

---

2. Technologies Used
- **Runtime**: Node.js (v25.1.0)
- **Framework**: Express.js (v5.2.1)
- **Object Modeling (MongoDB)**: Mongoose (v9.7.2)
- **Relational Client (PostgreSQL)**: pg (v8.22.0)
- **Validator**: express-validator (v7.3.2)
- **Security**: jsonwebtoken, bcryptjs
- **Monitoring & Dev Tools**: morgan, cors, nodemon

---

3. Folder Structure

```
task-manager-api/
├── src/
│   ├── config/              # Database pool & clients
│   │   ├── mongodb.js       # MongoDB connection script
│   │   └── postgres.js      # PostgreSQL pg Pool client
│   ├── controllers/         # Request handling & flow logic
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/          # Express route middlewares
│   │   ├── authMiddleware.js# JWT verification
│   │   ├── errorMiddleware.js# 404 & Global error handlers
│   │   └── validate.js      # Shared validator runner
│   ├── models/              # Schema & queries
│   │   ├── Task.js          # Mongoose Task schema
│   │   └── user.js          # PostgreSQL user queries
│   ├── routes/              # Express Router definitions
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── utils/               # App helper utilities
│   │   └── AppError.js      # Custom error wrapper
│   ├── validations/         # Validation validation rules
│   │   ├── authValidations.js
│   │   └── taskValidation.js
│   ├── app.js               # Express application base
│   └── server.js            # Server entry & startup logic
├── .env                     # Local environment settings
├── .gitignore               # Excluded file list
├── package.json
└── package-lock.json
```

---

4. Installation

1. Clone or copy the repository files.
2. Open your terminal in the directory root.
3. Install dependencies:
   ```bash
   npm install
   ```

---

5. Environment Variables

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
```

---

6. Database Setup

(i). PostgreSQL (User Management /Authentication Store)
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

(ii). MongoDB (Task Management / Task Store)
Ensure MongoDB is running locally on port `27017` with a database named `taskmanager`. The MongoDB collections will be automatically created on startup by the Mongoose schemas.

---

7. Run Project

### Development Mode
Runs the server with Nodemon (auto-reloads on file changes):
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

8. API Documentation

(i). Authentication Routes
- **`POST /api/auth/register`** — Registers a new user.
  - **Body**: `{ "email": "user@example.com", "password": "securepassword" }`
- **`POST /api/auth/login`** — Logs in an existing user and returns a token.
  - **Body**: `{ "email": "user@example.com", "password": "securepassword" }`

(ii). User Routes (Protected)
- **`GET /api/users/profile`** — Fetch current logged-in user profile.
  - **Headers**: `Authorization: Bearer <JWT_TOKEN>`

(iii). Task Routes (Protected)
- **`POST /api/tasks`** — Create a new task.
  - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
  - **Body**: `{ "title": "Review PRs", "description": "Check task controller", "dueDate": "2026-06-30T12:00:00Z" }`
- **`GET /api/tasks`** — Retrieve all tasks for the logged-in user.
  - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **`GET /api/tasks/:id`** — Retrieve a single task by its Mongo ID.
  - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **`PATCH /api/tasks/:id`** — Edit details of a task (only owners can modify).
  - **Headers**: `Authorization: Bearer <JWT_TOKEN>`
  - **Body**: `{ "status": "completed" }`
- **`DELETE /api/tasks/:id`** — Remove a task (only owners can delete).
  - **Headers**: `Authorization: Bearer <JWT_TOKEN>`

---

9. Sample Responses

(i). Registration Success (`POST /api/auth/register`)
**Status**: `201 Created`
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

(ii). Login Success (`POST /api/auth/login`)
**Status**: `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

(iii). Task Creation Success (`POST /api/tasks`)
**Status**: `201 Created`
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "title": "Set up validations",
    "description": "Ensure email formatting and dueDates are safe",
    "status": "pending",
    "userId": 1,
    "_id": "6a3fb22b78cc350e69ea0ba0",
    "createdAt": "2026-06-27T11:21:15.790Z",
    "updatedAt": "2026-06-27T11:21:15.790Z"
  }
}
```

(iv). Validation Error Response (e.g. invalid signup)
**Status**: `400 Bad Request`
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

(v). Task Not Found Response (e.g., accessing unauthorized or non-existent task)
**Status**: `404 Not Found`
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Task not found"
}
```

(vi). Task Update Success (`PATCH /api/tasks/:id`)
**Status**: `200 OK`
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "title": "Set up validations",
    "description": "Ensure email formatting and dueDates are safe",
    "status": "completed",
    "userId": 1,
    "_id": "6a3fb22b78cc350e69ea0ba0",
    "createdAt": "2026-06-27T11:21:15.790Z",
    "updatedAt": "2026-06-27T11:25:00.123Z"
  }
}
```

(vii). Task View Success (`GET /api/tasks/:id`)
**Status**: `200 OK`
```json
{
  "success": true,
  "task": {
    "title": "Set up validations",
    "description": "Ensure email formatting and dueDates are safe",
    "status": "completed",
    "userId": 1,
    "_id": "6a3fb22b78cc350e69ea0ba0",
    "createdAt": "2026-06-27T11:21:15.790Z",
    "updatedAt": "2026-06-27T11:25:00.123Z"
  }
}
```

(viii). All Tasks View Success (`GET /api/tasks`)
**Status**: `200 OK`
```json
{
  "success": true,
  "count": 1,
  "tasks": [
    {
      "title": "Set up validations",
      "description": "Ensure email formatting and dueDates are safe",
      "status": "completed",
      "userId": 1,
      "_id": "6a3fb22b78cc350e69ea0ba0",
      "createdAt": "2026-06-27T11:21:15.790Z",
      "updatedAt": "2026-06-27T11:25:00.123Z"
    }
  ]
}
```

(ix). Task Deletion Success (`DELETE /api/tasks/:id`)
**Status**: `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```
