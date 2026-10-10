const { z } = require('zod');

const triageInputSchema = z.object({
  message: z.string().trim().min(1).max(5000)
}).strict();

const triageResultSchema = z.object({
  category: z.enum(['billing', 'technical', 'account', 'shipping', 'refund', 'other']),
  urgency: z.enum(['low', 'medium', 'high']),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  summary: z.string().trim().min(1).max(500),
  confidence: z.number().min(0).max(1)
}).strict();

module.exports = { triageInputSchema, triageResultSchema };
