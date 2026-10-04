require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const Task = require('./models/task');

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_api';

const seedTasks = [
  { id: 1, title: 'Learn MongoDB', completed: false },
  { id: 2, title: 'Build the Task API', completed: false },
  { id: 3, title: 'Write the README', completed: false },
];

async function startServer() {
  await mongoose.connect(mongoUri);

  if (await Task.countDocuments() === 0) {
    await Task.insertMany(seedTasks, { ordered: true });
    console.log('Inserted the three starter tasks.');
  }

  app.listen(port, () => {
    console.log(`Task API running at http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });
}

startServer().catch((error) => {
  console.error('Could not start the server:', error.message);
  process.exitCode = 1;
});
