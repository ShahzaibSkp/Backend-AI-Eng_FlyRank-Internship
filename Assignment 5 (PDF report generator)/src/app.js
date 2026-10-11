const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const swaggerDocument = require("./swagger");
const { getDatabase } = require("./db");
const { createReport, getReport, listReports, retryReport } = require("./reportService");

const app = express();
app.use(helmet());
app.use(express.json({ limit: "64kb" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", async (req, res, next) => {
  try {
    await getDatabase().command({ ping: 1 });
    res.json({ status: "ok", database: "connected" });
  } catch (error) { next(error); }
});

app.get("/reports", async (req, res, next) => {
  try { res.json({ reports: await listReports(req.query) }); } catch (error) { next(error); }
});

app.post("/reports", async (req, res, next) => {
  try {
    const report = await createReport(req.body);
    res.status(202).location(`/reports/${report._id}`).json({
      id: report._id,
      status: report.status,
      statusUrl: `${config.reportBaseUrl}/reports/${report._id}`,
      downloadUrl: `${config.reportBaseUrl}/reports/${report._id}/download`
    });
  } catch (error) { next(error); }
});

app.get("/reports/:id", async (req, res, next) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (error) { next(error); }
});

app.get("/reports/:id/download", async (req, res, next) => {
  try {
    const report = await getReport(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "completed" || !report.artifact) {
      return res.status(409).json({ error: "Report is not ready", status: report.status });
    }
    if (!path.isAbsolute(report.artifact.filePath) || !report.artifact.filePath.startsWith(path.resolve(config.artifactDir))) {
      return res.status(500).json({ error: "Invalid artifact location" });
    }
    await fs.promises.access(report.artifact.filePath);
    res.download(report.artifact.filePath, report.artifact.fileName);
  } catch (error) { next(error); }
});

app.post("/reports/:id/retry", async (req, res, next) => {
  try {
    const report = await retryReport(req.params.id);
    if (!report) return res.status(409).json({ error: "Only failed reports can be retried" });
    res.status(202).json({ id: report._id, status: report.status });
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  const status = error.statusCode || (error.message.startsWith("Invalid") || error.message.includes("must be") ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: error.message || "Internal server error" });
});

module.exports = app;
