import { createApp } from "./app.js";
import { config } from "./config.js";
import { connectMongo } from "./mongo-store.js";
import { MemoryStore } from "./store.js";

let store = new MemoryStore();
try {
  ({ store } = await connectMongo(config.mongoUri, config.mongoDb));
  console.log("Connected to MongoDB");
} catch (error) {
  console.warn(`MongoDB unavailable; using in-memory demo store (${error.message})`);
}

const app = createApp({ store });
app.listen(config.port, () => console.log(`Image relevance API listening on port ${config.port}`));
