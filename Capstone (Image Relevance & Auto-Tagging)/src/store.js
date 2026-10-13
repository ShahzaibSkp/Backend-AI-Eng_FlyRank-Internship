import { randomUUID } from "node:crypto";

export class MemoryStore {
  constructor() {
    this.images = new Map();
    this.posts = new Map();
    this.jobs = new Map();
    this.costs = [];
    this.reviews = [];
  }

  async createImage(input) { const image = { _id: randomUUID(), ...input, status: "pending", createdAt: new Date().toISOString() }; this.images.set(image._id, image); return image; }
  async createPost(input) { const post = { _id: randomUUID(), ...input, createdAt: new Date().toISOString() }; this.posts.set(post._id, post); return post; }
  async listImages() { return [...this.images.values()]; }
  async getImage(id) { return this.images.get(id) || null; }
  async getPost(id) { return this.posts.get(id) || null; }
  async listPosts() { return [...this.posts.values()]; }
  async updateImage(id, update) { const image = this.images.get(id); if (!image) return null; Object.assign(image, update); return image; }
  async createJob(job) { const value = { _id: randomUUID(), ...job }; this.jobs.set(value._id, value); return value; }
  async updateJob(id, update) { const job = this.jobs.get(id); if (!job) return null; Object.assign(job, update); return job; }
  async getJob(id) { return this.jobs.get(id) || null; }
  async addCost(cost) { this.costs.push({ _id: randomUUID(), ...cost, createdAt: new Date().toISOString() }); }
  async listCosts() { return this.costs; }
  async addReview(review) { this.reviews.push({ _id: randomUUID(), ...review, createdAt: new Date().toISOString() }); return this.reviews.at(-1); }
}
