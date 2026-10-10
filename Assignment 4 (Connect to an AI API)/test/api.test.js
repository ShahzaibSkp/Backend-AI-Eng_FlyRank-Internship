import { describe, expect, it, vi } from 'vitest';
const request = require('supertest');
const { createApp } = require('../src/app');
const { AiClientError } = require('../src/aiClient');

const result = {
  category: 'technical', urgency: 'high', sentiment: 'negative',
  summary: 'The customer cannot log in.', confidence: 0.95
};

function setup() {
  const aiClient = { classify: vi.fn().mockResolvedValue(result) };
  return { app: createApp({ aiClient }), aiClient };
}

describe('triage endpoint', () => {
  it('returns a validated triage result', async () => {
    const { app } = setup();
    const response = await request(app).post('/api/v1/triage').send({ message: 'I cannot log in.' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(result);
  });
  it('rejects a missing message', async () => {
    const { app } = setup();
    expect((await request(app).post('/api/v1/triage').send({})).status).toBe(400);
  });
  it('rejects an empty message', async () => {
    const { app } = setup();
    expect((await request(app).post('/api/v1/triage').send({ message: '  ' })).status).toBe(400);
  });
  it('rejects unknown input fields', async () => {
    const { app } = setup();
    expect((await request(app).post('/api/v1/triage').send({ message: 'Hi', extra: true })).status).toBe(400);
  });
  it('sends the original message to the model', async () => {
    const { app, aiClient } = setup();
    await request(app).post('/api/v1/triage').send({ message: 'Where is my order?' });
    expect(aiClient.classify).toHaveBeenCalledWith('Where is my order?');
  });
  it('returns 502 for an unusable model result', async () => {
    const { app, aiClient } = setup();
    aiClient.classify.mockRejectedValue(new AiClientError('invalid', 'AI_SCHEMA_ERROR'));
    expect((await request(app).post('/api/v1/triage').send({ message: 'Hi' })).status).toBe(502);
  });
  it('returns 503 for a provider outage', async () => {
    const { app, aiClient } = setup();
    aiClient.classify.mockRejectedValue(new AiClientError('timeout', 'AI_TIMEOUT', true));
    expect((await request(app).post('/api/v1/triage').send({ message: 'Hi' })).status).toBe(503);
  });
  it('returns 500 for an unexpected processing error', async () => {
    const { app, aiClient } = setup();
    aiClient.classify.mockRejectedValue(new Error('unexpected failure'));
    expect((await request(app).post('/api/v1/triage').send({ message: 'Hi' })).status).toBe(500);
  });
  it('returns health status', async () => {
    const { app } = setup();
    expect((await request(app).get('/health')).body).toEqual({ status: 'ok' });
  });
});
