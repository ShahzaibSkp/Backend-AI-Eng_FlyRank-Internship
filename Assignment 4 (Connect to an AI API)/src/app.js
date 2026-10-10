const express = require('express');
const { triageInputSchema } = require('./triageSchema');
const { AiClientError } = require('./aiClient');

function createApp({ aiClient }) {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/v1/triage', async (req, res) => {
    const input = triageInputSchema.safeParse(req.body);
    if (!input.success) {
      return res.status(400).json({ error: 'message must be a non-empty string of 5000 characters or fewer' });
    }
    try {
      const result = await aiClient.classify(input.data.message);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AiClientError) {
        const status = error.code === 'AI_SCHEMA_ERROR' || error.code === 'AI_INVALID_RESPONSE' ? 502 : 503;
        return res.status(status).json({ error: 'AI service unavailable or returned an unusable result', code: error.code });
      }
      console.error('Triage request failed', error);
      return res.status(500).json({ error: 'Unable to process triage request' });
    }
  });

  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON' });
    return res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

module.exports = { createApp };
