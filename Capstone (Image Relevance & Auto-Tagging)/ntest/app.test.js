import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { DemoVisionProvider } from "../src/providers.js";
import { MemoryStore } from "../src/store.js";
import { processClassificationJob } from "../src/jobs.js";

describe("image relevance API", () => {
  it("exposes the OpenAPI document and Swagger UI", async () => {
    const app = createApp({ store: new MemoryStore() });
    const spec = await request(app).get("/openapi.json");
    const docs = await request(app).get("/docs/");

    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe("3.0.3");
    expect(spec.body.paths["/posts/{id}/images"]).toBeTruthy();
    expect(docs.status).toBe(200);
    expect(docs.text).toContain("swagger-ui");
  });

  it("rejects invalid input at the boundary", async () => {
    const app = createApp({ store: new MemoryStore() });
    const result = await request(app).post("/images").send({ title: "missing url" });
    expect(result.status).toBe(400);
  });

  it("classifies and flags low-confidence images", async () => {
    const store = new MemoryStore();
    const image = await store.createImage({ title: "uncertain abstract image", url: "https://example.com/x.jpg" });
    const job = await store.createJob({ type: "classify-images", status: "queued" });
    await processClassificationJob({ store, jobId: job._id, provider: new DemoVisionProvider(), config: { confidenceThreshold: 0.65, visionProvider: "demo" } });
    expect((await store.getImage(image._id)).status).toBe("flagged");
  });

  it("normalizes plural demo subjects before classification", async () => {
    const tags = await new DemoVisionProvider().classify({
      title: "A Wolf with open mouth",
      demoSubject: "Wolves"
    });

    expect(tags.subject).toBe("gray wolf");
    expect(tags.confidence).toBe(0.93);
  });

  it("returns no confident match for a wolf forced against a fox post", async () => {
    const store = new MemoryStore();
    const image = await store.createImage({ title: "gray wolf", demoSubject: "wolf", url: "https://example.com/wolf.jpg" });
    const post = await store.createPost({ title: "Red fox behavior", content: "red foxes in the forest" });
    const job = await store.createJob({ type: "classify-images", status: "queued" });
    await processClassificationJob({ store, jobId: job._id, provider: new DemoVisionProvider(), config: { confidenceThreshold: 0.65, visionProvider: "demo" } });
    const result = await request(createApp({ store })).get(`/posts/${post._id}/images`);
    expect(result.status).toBe(200);
    expect(result.body.message).toBe("no confident match");
    expect(result.body.candidates[0].accepted).toBe(false);
    expect(result.body.candidates[0].reason).toContain("mismatch");
    expect(await store.getImage(image._id)).toBeTruthy();
  });

  it("accepts the matching fox image and records idempotent job costs", async () => {
    const store = new MemoryStore();
    const image = await store.createImage({ title: "red fox", demoSubject: "fox", url: "https://example.com/fox.jpg" });
    const post = await store.createPost({ title: "Red fox behavior", content: "red foxes in the forest" });
    const job = await store.createJob({ type: "classify-images", status: "queued" });
    const jobConfig = { confidenceThreshold: 0.65, similarityThreshold: 0.35, visionProvider: "demo", maxAiCostUsd: 1 };

    await processClassificationJob({ store, jobId: job._id, provider: new DemoVisionProvider(), config: jobConfig });
    await processClassificationJob({ store, jobId: job._id, provider: new DemoVisionProvider(), config: jobConfig });

    const result = await request(createApp({ store, appConfig: jobConfig })).get(`/posts/${post._id}/images`);
    expect(result.body.message).toBe("confident match");
    expect(result.body.recommendation.image._id).toBe(image._id);
    expect((await store.listCosts()).filter((cost) => cost.imageId === image._id)).toHaveLength(2);
  });
});
