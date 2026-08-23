# Task API

A small Express.js REST API for creating, reading, updating, and deleting to-do tasks. It keeps tasks in memory while the server is running and provides an interactive Swagger UI.

## Install and run

Install dependencies, then start the API with this command:

```bash
npm install && npm start
```

The API runs at `http://localhost:3000` and Swagger UI is available at `http://localhost:3000/api-docs`.

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Return API name, version, and endpoint information |
| GET | `/api/health` | Check whether the API is running |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task with a required `title` |
| GET | `/api/tasks/:id` | Return one task by ID |
| PUT | `/api/tasks/:id` | Update a task's `title` and/or `completed` state |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api-docs` | Open the Swagger API documentation |

## Example response

```text
$ curl -i http://localhost:3000/
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-MI5kmM1z/AHKxM8xo8cNqUThTqA"
Date: Sun, 23 Aug 2026 15:37:41 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"name":"Task API","version":"1.0","endpoints":["/tasks"]}
```

## Swagger screenshot

![Swagger UI screenshot](Swagger%20(To-do%20opeations).png)
