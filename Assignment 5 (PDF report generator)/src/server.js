const app = require("./app");
const config = require("./config");
const { connectDatabase } = require("./db");
const { startWorker } = require("./worker");

async function main() {
  await connectDatabase();
  const server = app.listen(config.port, () => {
    console.log(`Report generator listening on port ${config.port}`);
  });
  startWorker();
  const shutdown = async () => {
    server.close();
    const { closeDatabase } = require("./db");
    await closeDatabase();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Unable to start service:", error.message);
  process.exitCode = 1;
});
