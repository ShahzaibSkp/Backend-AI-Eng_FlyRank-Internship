const fs = require("node:fs");
const path = require("node:path");
const PDFDocument = require("pdfkit");
const { ObjectId } = require("mongodb");
const config = require("./config");
const { getDatabase } = require("./db");

const allowedStatuses = new Set(["pending", "running", "completed", "failed"]);
const allowedFormats = new Set(["pdf"]);

function parseDate(value, fieldName) {
  if (value === undefined) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${fieldName} must be a valid ISO date`);
  return date;
}

function validateReportRequest(input = {}) {
  const from = parseDate(input.from, "from");
  const to = parseDate(input.to, "to");
  if (from && to && from > to) throw new Error("from must be before to");
  const format = input.format || "pdf";
  if (!allowedFormats.has(format)) throw new Error("format must be pdf");
  return { from, to, format };
}

function idOrThrow(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Invalid report id");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(id);
}

async function createReport(input) {
  const request = validateReportRequest(input);
  const now = new Date();
  const report = {
    type: "sales",
    format: request.format,
    filters: { from: request.from, to: request.to },
    status: "pending",
    attempts: 0,
    createdAt: now,
    updatedAt: now
  };
  const result = await getDatabase().collection("reportJobs").insertOne(report);
  return { ...report, _id: result.insertedId };
}

async function getReport(id) {
  return getDatabase().collection("reportJobs").findOne({ _id: idOrThrow(id) });
}

async function listReports({ status, limit = 20, skip = 0 } = {}) {
  if (status && !allowedStatuses.has(status)) throw new Error("Invalid report status");
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safeSkip = Math.max(Number(skip) || 0, 0);
  return getDatabase().collection("reportJobs")
    .find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .skip(safeSkip)
    .limit(safeLimit)
    .toArray();
}

async function claimNextReport() {
  const now = new Date();
  const result = await getDatabase().collection("reportJobs").findOneAndUpdate(
    { status: "pending" },
    { $set: { status: "running", startedAt: now, updatedAt: now }, $inc: { attempts: 1 } },
    { sort: { createdAt: 1 }, returnDocument: "after" }
  );
  return result;
}

async function aggregateSales(filters) {
  const match = {};
  const range = {};
  if (filters.from) range.$gte = new Date(filters.from);
  if (filters.to) range.$lte = new Date(filters.to);
  if (Object.keys(range).length) match.createdAt = range;

  const rows = await getDatabase().collection("orders").aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        orders: { $sum: 1 },
        units: { $sum: "$quantity" },
        revenue: { $sum: { $multiply: ["$quantity", "$unitPrice"] } }
      }
    },
    { $sort: { revenue: -1 } }
  ]).toArray();
  const totals = rows.reduce((result, row) => ({
    orders: result.orders + row.orders,
    units: result.units + row.units,
    revenue: result.revenue + row.revenue
  }), { orders: 0, units: 0, revenue: 0 });
  return { rows, totals };
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function renderPdf(report, data, filePath) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    stream.on("error", reject);
    stream.on("finish", resolve);
    document.pipe(stream);
    document.fontSize(22).text("Sales Report", { align: "center" });
    document.moveDown().fontSize(10).fillColor("#555").text(
      `Generated ${new Date().toISOString()} | Report ${report._id.toString()}`
    );
    document.fillColor("#000").moveDown();
    document.fontSize(12).text(`Orders: ${data.totals.orders}`);
    document.text(`Units: ${data.totals.units}`);
    document.text(`Revenue: ${money(data.totals.revenue)}`);
    document.moveDown().fontSize(14).text("Revenue by category");
    document.moveDown(0.5).fontSize(10);
    data.rows.forEach((row) => {
      document.text(`${row._id || "Uncategorized"}  |  ${row.orders} orders  |  ${row.units} units  |  ${money(row.revenue)}`);
    });
    document.end();
  });
}

async function processReport(report) {
  await fs.promises.mkdir(config.artifactDir, { recursive: true });
  const data = await aggregateSales(report.filters || {});
  const fileName = `${report._id.toString()}.pdf`;
  const filePath = path.resolve(config.artifactDir, fileName);
  await renderPdf(report, data, filePath);
  const updatedAt = new Date();
  await getDatabase().collection("reportJobs").updateOne(
    { _id: report._id, status: "running" },
    {
      $set: {
        status: "completed",
        artifact: { fileName, filePath, contentType: "application/pdf", size: (await fs.promises.stat(filePath)).size },
        summary: data.totals,
        completedAt: updatedAt,
        updatedAt
      }
    }
  );
}

async function failReport(report, error) {
  await getDatabase().collection("reportJobs").updateOne(
    { _id: report._id },
    { $set: { status: "failed", error: error.message, failedAt: new Date(), updatedAt: new Date() } }
  );
}

async function retryReport(id) {
  const result = await getDatabase().collection("reportJobs").findOneAndUpdate(
    { _id: idOrThrow(id), status: "failed" },
    { $set: { status: "pending", updatedAt: new Date() }, $unset: { error: "", failedAt: "" } },
    { returnDocument: "after" }
  );
  return result;
}

module.exports = {
  createReport, getReport, listReports, claimNextReport, processReport, failReport,
  retryReport, validateReportRequest
};
