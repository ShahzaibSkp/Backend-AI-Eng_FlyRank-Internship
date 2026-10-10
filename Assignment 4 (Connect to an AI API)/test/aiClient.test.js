import { describe, expect, it, vi } from 'vitest';
const { createAiClient } = require('../src/aiClient');

const valid = { category: 'other', urgency: 'low', sentiment: 'neutral', summary: 'A simple request.', confidence: 0.8 };
const response = (body, status = 200, headers = {}) => ({ ok: status >= 200 && status < 300, status, headers: new Headers(headers), json: async () => body });
const config = { baseUrl: 'https://example.test/v1', apiKey: 'key', model: 'test', timeoutMs: 100, maxRetries: 2 };

describe('AI client reliability', () => {
  it('parses a valid structured response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ choices: [{ message: { content: JSON.stringify(valid) } }] }));
    await expect(createAiClient({ ...config, fetchImpl }).classify('hello')).resolves.toEqual(valid);
  });
  it('retries a transient 500 and then succeeds', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(response({}, 500)).mockResolvedValueOnce(response({ choices: [{ message: { content: JSON.stringify(valid) } }] }));
    await expect(createAiClient({ ...config, fetchImpl, sleepImpl: vi.fn() }).classify('hello')).resolves.toEqual(valid);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
  it('stops after the configured retry count', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({}, 503));
    await expect(createAiClient({ ...config, fetchImpl, sleepImpl: vi.fn() }).classify('hello')).rejects.toMatchObject({ code: 'AI_PROVIDER_ERROR' });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
  it('rejects schema-invalid model output', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ choices: [{ message: { content: '{"category":"bad"}' } }] }));
    await expect(createAiClient({ ...config, fetchImpl }).classify('hello')).rejects.toMatchObject({ code: 'AI_SCHEMA_ERROR' });
  });
});
