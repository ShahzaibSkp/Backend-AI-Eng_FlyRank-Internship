import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  mongoDb: process.env.MONGODB_DB || "image_relevance",
  visionProvider: process.env.VISION_PROVIDER || "demo",
  similarityThreshold: Number(process.env.SIMILARITY_THRESHOLD || 0.25),
  confidenceThreshold: Number(process.env.CONFIDENCE_THRESHOLD || 0.65),
  maxAiCostUsd: Number(process.env.MAX_AI_COST_USD || 1)
};
