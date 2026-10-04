const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const Task = require('./models/task');

const app = express();

app.use(express.json());
app.use(cors());

function validateTaskInput(body, isUpdate = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  if (!isUpdate && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return 'Title is required and must be a non-empty string.';
  }

  if (isUpdate && body.title !== undefined &&
      (typeof body.title !== 'string' || body.title.trim() === '')) {
    return 'Title must be a non-empty string.';
  }

  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    return 'Completed must be a boolean.';
  }

  return null;
}

function toTaskResponse(task) {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
  };
}

app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '2.0',
    endpoints: ['/api/tasks'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', async (req, res, next) => {
  try {
    const query = {};
    if (req.query.done !== undefined) {
      query.completed = req.query.done === 'true';
    }
    if (req.query.search) {
      query.title = { $regex: String(req.query.search), $options: 'i' };
    }

    const tasks = await Task.find(query).sort({ id: 1 }).lean();
    res.json(tasks.map(toTaskResponse));
  } catch (error) {
    next(error);
  }
});

app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: Number(req.params.id) }).lean();
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(toTaskResponse(task));
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  const validationError = validateTaskInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const latestTask = await Task.findOne().sort({ id: -1 }).select('id').lean();
    const task = await Task.create({
      id: latestTask ? latestTask.id + 1 : 1,
      title: req.body.title.trim(),
      completed: req.body.completed ?? false,
    });
    res.status(201).json(toTaskResponse(task));
  } catch (error) {
    next(error);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  const validationError = validateTaskInput(req.body, true);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.completed !== undefined) updates.completed = req.body.completed;

    const task = await Task.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(toTaskResponse(task));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const result = await Task.deleteOne({ id: Number(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Task API',
    version: '2.0.0',
    description: 'Create, read, update, and delete persistent to-do tasks.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [{ name: 'Tasks', description: 'To-do task operations' }],
  paths: {
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List all tasks',
        responses: { 200: { description: 'Tasks returned.' } },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } } },
        responses: { 201: { description: 'Task created.' }, 400: { description: 'Invalid input.' } },
      },
    },
    '/api/tasks/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Tasks'],
        summary: 'Get one task',
        responses: { 200: { description: 'Task returned.' }, 404: { description: 'Task not found.' } },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } } },
        responses: { 200: { description: 'Task updated.' }, 400: { description: 'Invalid input.' }, 404: { description: 'Task not found.' } },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        responses: { 204: { description: 'Task deleted.' }, 404: { description: 'Task not found.' } },
      },
    },
  },
  components: {
    schemas: {
      Task: {
        type: 'object', required: ['id', 'title', 'completed'],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Buy milk' },
          completed: { type: 'boolean', example: false },
        },
      },
      TaskInput: {
        type: 'object', required: ['title'],
        properties: {
          title: { type: 'string', example: 'Buy a book' },
          completed: { type: 'boolean', default: false },
        },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
