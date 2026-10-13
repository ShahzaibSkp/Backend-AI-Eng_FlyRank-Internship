import { AppError } from "./errors.js";
import { embedding } from "./vector.js";

export async function processClassificationJob({ store, jobId, provider, config }) {
  const job = await store.getJob(jobId);
  if (!job) throw new AppError(404, "Job not found");
  const images = await store.listImages();
  await store.updateJob(jobId, { status: "running", total: images.length, processed: 0 });
  let failed = 0;
  for (const [index, image] of images.entries()) {
    if (image.processedAt && image.embedding) {
      await store.updateJob(jobId, { processed: index + 1 });
      continue;
    }
    if (Number.isFinite(config.maxAiCostUsd)) {
      const costs = await store.listCosts();
      const currentCost = costs.reduce((sum, cost) => sum + Number(cost.amountUsd || 0), 0);
      if (currentCost >= config.maxAiCostUsd) {
        const message = `AI cost budget of ${config.maxAiCostUsd.toFixed(4)} USD has been reached`;
        await store.updateJob(jobId, { status: "failed", error: message, failed, completedAt: new Date().toISOString() });
        throw new Error(message);
      }
    }
    let error;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const tags = await provider.classify(image);
        const status = tags.confidence >= config.confidenceThreshold ? "classified" : "flagged";
        const imageEmbedding = embedding(`${tags.subject} ${tags.caption} ${tags.attributes.join(" ")}`);
        await store.updateImage(image._id, {
          tags,
          status,
          embedding: imageEmbedding,
          attempts: attempt,
          processedAt: new Date().toISOString()
        });
        await store.addCost({ jobId, imageId: image._id, operation: "vision", provider: config.visionProvider, amountUsd: config.visionProvider === "gemini" ? 0.0001 : 0 });
        await store.addCost({ jobId, imageId: image._id, operation: "embedding", provider: "local", amountUsd: 0 });
        error = undefined;
        break;
      } catch (caught) {
        error = caught;
        await store.updateImage(image._id, { attempts: attempt, lastError: caught.message, status: attempt === 3 ? "failed" : "pending" });
      }
    }
    if (error) failed += 1;
    await store.updateJob(jobId, { processed: index + 1 });
  }
  return store.updateJob(jobId, { status: failed ? "completed_with_errors" : "completed", failed, completedAt: new Date().toISOString() });
}
