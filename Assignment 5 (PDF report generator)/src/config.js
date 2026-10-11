require("dotenv").config();

const config = {
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  mongoDb: process.env.MONGODB_DB || "report_generator",
  artifactDir: process.env.ARTIFACT_DIR || "./storage/reports",
  reportBaseUrl: process.env.REPORT_BASE_URL || "http://localhost:3000",
  workerPollMs: Number(process.env.REPORT_WORKER_POLL_MS || 1000),
  reportSchedule: process.env.REPORT_SCHEDULE || ""
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

module.exports = config;
