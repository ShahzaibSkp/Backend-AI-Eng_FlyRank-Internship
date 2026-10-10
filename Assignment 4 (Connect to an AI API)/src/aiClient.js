const { triageResultSchema } = require('./triageSchema');

const SYSTEM_PROMPT = [
  'You classify customer support messages.',
  'Return only valid JSON with exactly these keys:',
  'category (billing|technical|account|shipping|refund|other),',
  'urgency (low|medium|high), sentiment (positive|neutral|negative),',
  'summary (1-2 sentences, max 500 characters), confidence (number 0 to 1).',
  'Do not invent details. Use other when the category is unclear.'
].join(' ');

class AiClientError extends Error {
  constructor(message, code, retryable = false) {
    super(message);
    this.name = 'AiClientError';
    this.code = code;
    this.retryable = retryable;
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getRetryDelay(response, attempt) {
  const retryAfter = response.headers.get('retry-after');
  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) ? Math.min(seconds * 1000, 10000) : 250 * (2 ** attempt);
}

async function requestWithTimeout(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiClientError('AI provider timed out', 'AI_TIMEOUT', true);
    }
    throw new AiClientError('AI provider request failed', 'AI_NETWORK_ERROR', true);
  } finally {
    clearTimeout(timer);
  }
}

function createAiClient({
  provider = 'openai',
  baseUrl,
  apiKey,
  model,
  timeoutMs,
  maxRetries,
  fetchImpl = fetch,
  sleepImpl = sleep
}) {
  return {
    async classify(message) {
      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        let response;
        try {
          const isGoogle = provider === 'google';
          const url = isGoogle
            ? `${baseUrl.replace(/\/$/, '')}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
            : `${baseUrl.replace(/\/$/, '')}/chat/completions`;
          const body = isGoogle
            ? {
              contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nCustomer message:\n${message}` }] }],
              generationConfig: { temperature: 0, responseMimeType: 'application/json' }
            }
            : {
              model,
              temperature: 0,
              response_format: { type: 'json_object' },
              messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: message }]
            };
          response = await requestWithTimeout(fetchImpl, url, {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...(isGoogle ? {} : { authorization: `Bearer ${apiKey}` }) },
            body: JSON.stringify(body)
          }, timeoutMs);
        } catch (error) {
          if (!(error instanceof AiClientError) || !error.retryable || attempt === maxRetries) throw error;
          await sleepImpl(250 * (2 ** attempt));
          continue;
        }

        if (!response.ok) {
          const retryable = response.status === 429 || response.status >= 500;
          if (retryable && attempt < maxRetries) {
            await sleepImpl(getRetryDelay(response, attempt));
            continue;
          }
          throw new AiClientError(`AI provider returned HTTP ${response.status}`, 'AI_PROVIDER_ERROR', retryable);
        }

        let payload;
        try {
          payload = await response.json();
        } catch {
          throw new AiClientError('AI provider returned invalid JSON', 'AI_INVALID_RESPONSE');
        }
        const content = provider === 'google'
          ? payload?.candidates?.[0]?.content?.parts?.[0]?.text
          : payload?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') throw new AiClientError('AI response did not contain content', 'AI_INVALID_RESPONSE');
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          throw new AiClientError('AI response content was not JSON', 'AI_INVALID_RESPONSE');
        }
        const result = triageResultSchema.safeParse(parsed);
        if (!result.success) throw new AiClientError('AI response failed schema validation', 'AI_SCHEMA_ERROR');
        return result.data;
      }
      throw new AiClientError('AI request exhausted retries', 'AI_RETRY_EXHAUSTED');
    }
  };
}

module.exports = { createAiClient, AiClientError, SYSTEM_PROMPT };
