const { MongoClient } = require("mongodb");
const config = require("./config");

let client;
let database;

async function connectDatabase() {
  if (database) return database;
  client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
  await client.connect();
  database = client.db(config.mongoDb);
  await database.collection("reportJobs").createIndex({ status: 1, createdAt: 1 });
  await database.collection("reportJobs").createIndex({ createdAt: -1 });
  await database.collection("orders").createIndex({ createdAt: 1 });
  return database;
}

function getDatabase() {
  if (!database) throw new Error("Database is not connected");
  return database;
}

async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}

module.exports = { connectDatabase, getDatabase, closeDatabase };
