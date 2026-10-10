const { z } = require('zod');

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  AI_PROVIDER: z.enum(['google', 'openai']).default('google'),
  AI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta'),
  AI_API_KEY: z.string().min(1),
  AI_MODEL: z.string().min(1).default('gemini-3-flash-preview'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2)
});

function loadConfig(env = process.env) {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
  }
  return result.data;
}

module.exports = { loadConfig };
