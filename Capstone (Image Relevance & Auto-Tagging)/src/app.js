import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { AppError, errorHandler } from "./errors.js";
import { guardMatch } from "./guard.js";
import { processClassificationJob } from "./jobs.js";
import { openapiDocument } from "./openapi.js";
import { DemoVisionProvider, GeminiVisionProvider } from "./providers.js";
import { imageInputSchema, postInputSchema, reviewInputSchema } from "./schemas.js";
import { embedding, cosineSimilarity } from "./vector.js";

const asyncRoute = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
const parsed = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError(400, "Request validation failed", result.error.flatten());
  return result.data;
};

export function createApp({ store, provider = config.visionProvider === "gemini" ? new GeminiVisionProvider(process.env.GEMINI_API_KEY) : new DemoVisionProvider(), appConfig = config }) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.get("/openapi.json", (_request, response) => response.json(openapiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.post("/images", asyncRoute(async (request, response) => response.status(201).json(await store.createImage(parsed(imageInputSchema, request.body)))));
  app.get("/images", asyncRoute(async (_request, response) => response.json({ data: await store.listImages() })));
  app.post("/posts", asyncRoute(async (request, response) => response.status(201).json(await store.createPost(parsed(postInputSchema, request.body)))));
  app.get("/posts", asyncRoute(async (_request, response) => response.json({ data: await store.listPosts() })));
  app.post("/jobs/classify", asyncRoute(async (_request, response) => {
    const job = await store.createJob({ type: "classify-images", status: "queued", processed: 0, total: 0 });
    setImmediate(() => processClassificationJob({ store, jobId: job._id, provider, config: appConfig }).catch((error) => store.updateJob(job._id, { status: "failed", error: error.message })));
    response.status(202).json(job);
  }));
  app.get("/jobs/:id", asyncRoute(async (request, response) => {
    const job = await store.getJob(request.params.id);
    if (!job) throw new AppError(404, "Job not found");
    response.json(job);
  }));
  app.get("/posts/:id/images", asyncRoute(async (request, response) => {
    const post = await store.getPost(request.params.id);
    if (!post) throw new AppError(404, "Post not found");
    const images = await store.listImages();
    const postVector = embedding(`${post.title} ${post.content}`);
    const ranked = images.map((image) => {
      const similarity = cosineSimilarity(image.embedding || [], postVector);
      const guard = guardMatch({ post, image, similarity, confidenceThreshold: appConfig.confidenceThreshold, similarityThreshold: appConfig.similarityThreshold });
      return { image, similarity: Number(similarity.toFixed(4)), ...guard };
    }).sort((left, right) => right.similarity - left.similarity);
    const accepted = ranked.find((item) => item.accepted);
    response.json({ post, recommendation: accepted || null, message: accepted ? "confident match" : "no confident match", candidates: ranked });
  }));
  app.post("/posts/:postId/images/:imageId/review", asyncRoute(async (request, response) => {
    const body = parsed(reviewInputSchema, request.body);
    const post = await store.getPost(request.params.postId);
    const image = await store.getImage(request.params.imageId);
    if (!post || !image) throw new AppError(404, "Post or image not found");
    response.status(201).json(await store.addReview({ postId: post._id, imageId: image._id, ...body }));
  }));
  app.get("/costs", asyncRoute(async (_request, response) => response.json({ data: await store.listCosts() })));
  app.use(errorHandler);
  return app;
}
