const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

let nextTaskId = 1;
const tasks = [];

function findTask(taskId) { 
	return tasks.find((task) => task.id === Number(taskId));
}

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

app.get('/', (req, res) => {
	res.json({
		name: 'Task API',
		version: '1.0',
		endpoints: ['/tasks'],
	});
});

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.get('/api/tasks', (req, res) => {
	res.json(tasks);
});

app.get('/api/tasks/:id', (req, res) => {
	const task = findTask(req.params.id);

	if (!task) {
		return res.status(404).json({ error: 'Task not found.' });
	}

	res.json(task);
});

app.post('/api/tasks', (req, res) => {
	const validationError = validateTaskInput(req.body);

	if (validationError) {
		return res.status(400).json({ error: validationError });
	}

	const task = {
		id: nextTaskId++,
		title: req.body.title.trim(),
		completed: req.body.completed ?? false,
	};

	tasks.push(task);
	res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
	const task = findTask(req.params.id);
	const validationError = validateTaskInput(req.body, true);

	if (!task) {
		return res.status(404).json({ error: 'Task not found.' });
	}

	if (validationError) {
		return res.status(400).json({ error: validationError });
	}

	if (req.body.title !== undefined) task.title = req.body.title.trim();
	if (req.body.completed !== undefined) task.completed = req.body.completed;

	res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
	const taskIndex = tasks.findIndex((task) => task.id === Number(req.params.id));

	if (taskIndex === -1) {
		return res.status(404).json({ error: 'Task not found.' });
	}

	tasks.splice(taskIndex, 1);
	res.status(204).send();
});

const swaggerDocument = {
	openapi: '3.0.3',
	info: {
		title: 'CURD API To-do List',
		version: '1.0.0',
		description: 'Create, read, update, and delete To-do Tasks.',
	},
	servers: [{ url: `http://localhost:${port}` }],
	tags: [{ name: 'Tasks', description: 'To-do task operations' }],
	paths: {
		'/api/tasks': {
			get: {
				tags: ['Tasks'], summary: 'List all tasks',
				responses: { 200: { description: 'Tasks returned.' } },
			},
			post: {
				tags: ['Tasks'], summary: 'Create a task',
				requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/TaskInput' } } } },
				responses: { 201: { description: 'Task created.' }, 400: { description: 'Invalid input.' } },
			},
		},
		'/api/tasks/{id}': {
			parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
			get: {
				tags: ['Tasks'], summary: 'Get one task',
				responses: { 200: { description: 'Task returned.' }, 404: { description: 'Task not found.' } },
			},
			put: {
				tags: ['Tasks'], summary: 'Update a task',
				requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/TaskInput' } } } },
				responses: { 200: { description: 'Task updated.' }, 400: { description: 'Invalid input.' }, 404: { description: 'Task not found.' } },
			},
			delete: {
				tags: ['Tasks'], summary: 'Delete a task',
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
					title: { type: 'string', example: 'Buy Milk' },
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

if (require.main === module) {
	app.listen(port, () => {
		console.log(`To-do API running at http://localhost:${port}`);
		console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
	});
}

module.exports = app;