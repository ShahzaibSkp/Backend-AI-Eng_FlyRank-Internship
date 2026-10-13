import { MongoClient, ObjectId } from "mongodb";

function id(value) { return ObjectId.isValid(value) ? new ObjectId(value) : value; }

export class MongoStore {
  constructor(db) {
    this.db = db;
    this.images = db.collection("images");
    this.posts = db.collection("posts");
    this.jobs = db.collection("jobs");
    this.costs = db.collection("costs");
    this.reviews = db.collection("reviews");
  }

  async createIndexes() {
    await Promise.all([
      this.images.createIndex({ status: 1 }),
      this.posts.createIndex({ createdAt: -1 }),
      this.jobs.createIndex({ status: 1, createdAt: -1 }),
      this.costs.createIndex({ createdAt: -1 })
    ]);
  }
  async createImage(input) { const value = { ...input, status: "pending", createdAt: new Date() }; const result = await this.images.insertOne(value); return { ...value, _id: result.insertedId.toString() }; }
  async createPost(input) { const value = { ...input, createdAt: new Date() }; const result = await this.posts.insertOne(value); return { ...value, _id: result.insertedId.toString() }; }
  async listImages() { return this.images.find().toArray(); }
  async getImage(value) { return this.images.findOne({ _id: id(value) }); }
  async getPost(value) { return this.posts.findOne({ _id: id(value) }); }
  async listPosts() { return this.posts.find().sort({ createdAt: -1 }).toArray(); }
  async updateImage(value, update) { await this.images.updateOne({ _id: id(value) }, { $set: update }); return this.getImage(value); }
  async createJob(job) { const value = { ...job, createdAt: new Date() }; const result = await this.jobs.insertOne(value); return { ...value, _id: result.insertedId.toString() }; }
  async updateJob(value, update) { await this.jobs.updateOne({ _id: id(value) }, { $set: update }); return this.getJob(value); }
  async getJob(value) { return this.jobs.findOne({ _id: id(value) }); }
  async addCost(cost) { await this.costs.insertOne({ ...cost, createdAt: new Date() }); }
  async listCosts() { return this.costs.find().sort({ createdAt: -1 }).toArray(); }
  async addReview(review) { const value = { ...review, createdAt: new Date() }; const result = await this.reviews.insertOne(value); return { ...value, _id: result.insertedId.toString() }; }
}

export async function connectMongo(uri, database) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
  await client.connect();
  const store = new MongoStore(client.db(database));
  await store.createIndexes();
  return { client, store };
}
