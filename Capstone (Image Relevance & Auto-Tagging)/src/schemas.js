import { z } from "zod";

export const imageTagsSchema = z.object({
  subject: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  attributes: z.array(z.string().min(1).max(80)).max(20),
  caption: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1)
});

export const imageInputSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  source: z.string().max(100).optional(),
  demoSubject: z.string().max(100).optional()
});

export const postInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000)
});

export const reviewInputSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().max(1000).optional()
});
