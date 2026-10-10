require('dotenv').config();
const { loadConfig } = require('./config');
const { createAiClient } = require('./aiClient');
const { createApp } = require('./app');

async function start() {
  const config = loadConfig();
  const app = createApp({
    aiClient: createAiClient({
      provider: config.AI_PROVIDER,
      baseUrl: config.AI_BASE_URL,
      apiKey: config.AI_API_KEY,
      model: config.AI_MODEL,
      timeoutMs: config.AI_TIMEOUT_MS,
      maxRetries: config.AI_MAX_RETRIES
    })
  });
  const server = app.listen(config.PORT, () => console.log(`API listening on port ${config.PORT}`));
  const shutdown = async () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
