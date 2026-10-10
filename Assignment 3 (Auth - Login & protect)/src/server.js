import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import publicRoutes from './routes/public.js';
import './config/supabase.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const openapiDocument = JSON.parse(
  readFileSync(resolve(projectRoot, 'openapi.json'), 'utf8')
);

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/public', publicRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running and connected to Supabase on port ${port}`);
});
