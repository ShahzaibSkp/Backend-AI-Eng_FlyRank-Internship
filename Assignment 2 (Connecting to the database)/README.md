# Task API with MongoDB

Week 3, Assignment 1: a persistent version of the CRUD Task API from Assignment 1.

## Why MongoDB?

MongoDB fits the JavaScript stack used by this API and is already available through MongoDB Compass. Mongoose provides schema validation and a clear model layer while the HTTP API remains unchanged. Unlike the original in-memory array, tasks remain available after the Node.js process restarts.

## Requirements

- Node.js 18 or newer
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Run the project

```bash
npm install
copy .env.example .env
npm start
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

The default database is `task_api` at `mongodb://127.0.0.1:27017/task_api`. MongoDB creates the database and collection automatically. On the first successful startup, the server inserts three starter tasks. Later restarts do not insert duplicates.

To use Atlas, set `MONGODB_URI` in `.env` to your connection string.

## Endpoints

- `GET /api/health`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api-docs`

The request and response format is unchanged from Assignment 1. A task has `id`, `title`, and `completed` fields.

Optional filters are also available:

- `GET /api/tasks?search=mongo`
- `GET /api/tasks?done=true`

## Example requests

```bash
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d "{\"title\":\"Review MongoDB indexes\"}"
curl -X PUT http://localhost:3000/api/tasks/1 -H "Content-Type: application/json" -d "{\"completed\":true}"
curl -X DELETE http://localhost:3000/api/tasks/1
```

## MongoDB Compass checks

Open the `task_api` database and the `tasks` collection in Compass. Create a task through the API, restart the server, and refresh Compass or `GET /api/tasks` to confirm that the document is still present.

Equivalent MongoDB shell checks:

```javascript
db.tasks.find()
db.tasks.find({ completed: true })
db.tasks.countDocuments()
db.tasks.updateMany({}, { $set: { completed: true } })
db.tasks.deleteMany({ completed: true })
```

The API immediately reflects changes made manually in Compass or the MongoDB shell.

## a screenshot of your database viewer

![App Dashboard](screenshots/Screenshot%202026-10-04%20172234.png)

## one example MongoDB query executed

![App Dashboard](screenshots/Screenshot%202026-10-04%20172126.png)
