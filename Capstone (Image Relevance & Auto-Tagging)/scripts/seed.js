import { createApp } from "../src/app.js";
import { config } from "../src/config.js";
import { connectMongo } from "../src/mongo-store.js";
import { DemoVisionProvider } from "../src/providers.js";
import { MemoryStore } from "../src/store.js";

const images = [
  ["Red fox in forest", "fox", "https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=900&q=80"],
  ["Gray wolf in forest", "wolf", "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=900&q=80"],
  ["Domestic dog outdoors", "dog", "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80"],
  ["Brown bear in mountains", "bear", "https://images.unsplash.com/photo-1530595467537-0b5996c0c9d8?auto=format&fit=crop&w=900&q=80"],
  ["Deer in grassland", "deer", "https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=900&q=80"],
  ["Uncertain abstract image", "uncertain", "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=80"]
];
const posts = [
  ["Red fox behavior", "The behavior and habitat of red foxes in a forest."],
  ["Wolf ecology", "How gray wolves live and hunt in forests."],
  ["Domestic dogs", "A guide to domestic dogs and their outdoor behavior."]
];

let store;
let client;
try { ({ store, client } = await connectMongo(config.mongoUri, config.mongoDb)); } catch { store = new MemoryStore(); }
for (const [title, demoSubject, url] of images) await store.createImage({ title, demoSubject, url, source: "Unsplash demo corpus" });
for (const [title, content] of posts) await store.createPost({ title, content });
const job = await store.createJob({ type: "classify-images", status: "queued", processed: 0, total: 0 });
const { processClassificationJob } = await import("../src/jobs.js");
await processClassificationJob({ store, jobId: job._id, provider: new DemoVisionProvider(), config });
console.log(`Seeded ${images.length} images and ${posts.length} posts`);
await client?.close();
