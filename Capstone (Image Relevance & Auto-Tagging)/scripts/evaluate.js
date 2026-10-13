import { guardMatch } from "../src/guard.js";
import { embedding, cosineSimilarity } from "../src/vector.js";
const cases = [
  { post: { title: "Red fox behavior", content: "red fox forest" }, image: { status: "classified", tags: { subject: "red fox", category: "animal", confidence: 0.94 }, embedding: embedding("red fox forest") }, expected: true },
  { post: { title: "Red fox behavior", content: "red fox forest" }, image: { status: "classified", tags: { subject: "gray wolf", category: "animal", confidence: 0.93 }, embedding: embedding("gray wolf forest") }, expected: false }
];
const results = cases.map(({ post, image, expected }) => guardMatch({ post, image, similarity: cosineSimilarity(image.embedding, embedding(`${post.title} ${post.content}`)), confidenceThreshold: 0.65, similarityThreshold: 0.2 }).accepted === expected);
console.log(`Top-1 guard precision: ${results.filter(Boolean).length}/${results.length} (${(results.filter(Boolean).length / results.length * 100).toFixed(0)}%)`);
