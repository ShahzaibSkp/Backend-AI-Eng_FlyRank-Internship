const config = require("./config");
const { claimNextReport, processReport, failReport } = require("./reportService");

let timer;
let working = false;

async function runOnce() {
  if (working) return;
  working = true;
  try {
    const report = await claimNextReport();
    if (report) {
      try {
        await processReport(report);
      } catch (error) {
        await failReport(report, error);
        console.error(`Report ${report._id} failed:`, error.message);
      }
    }
  } finally {
    working = false;
  }
}

function startWorker() {
  timer = setInterval(() => runOnce().catch((error) => console.error("Worker error:", error.message)), config.workerPollMs);
  timer.unref();
  return { stop: stopWorker };
}

function stopWorker() {
  if (timer) clearInterval(timer);
  timer = undefined;
}

module.exports = { startWorker, stopWorker, runOnce };
