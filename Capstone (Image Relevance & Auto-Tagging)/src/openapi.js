export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "FlyRank Image Relevance API",
    version: "1.0.0",
    description: "Backend-only image understanding, matching, mismatch guarding, and review API."
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "System" },
    { name: "Images" },
    { name: "Posts" },
    { name: "Jobs" },
    { name: "Reviews" },
    { name: "Costs" }
  ],
  components: {
    parameters: {
      id: { name: "id", in: "path", required: true, schema: { type: "string" } },
      postId: { name: "postId", in: "path", required: true, schema: { type: "string" } },
      imageId: { name: "imageId", in: "path", required: true, schema: { type: "string" } }
    },
    schemas: {
      ImageInput: {
        type: "object",
        required: ["title", "url"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          url: { type: "string", format: "uri" },
          source: { type: "string", maxLength: 100 },
          demoSubject: { type: "string", maxLength: 100 }
        }
      },
      PostInput: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          content: { type: "string", minLength: 1, maxLength: 10000 }
        }
      },
      ReviewInput: {
        type: "object",
        required: ["decision"],
        properties: {
          decision: { type: "string", enum: ["approved", "rejected"] },
          note: { type: "string", maxLength: 1000 }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check API health",
        responses: { 200: { description: "API is healthy" } }
      }
    },
    "/images": {
      post: {
        tags: ["Images"],
        summary: "Create an image",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ImageInput" } } }
        },
        responses: { 201: { description: "Image created" }, 400: { description: "Invalid request" } }
      },
      get: {
        tags: ["Images"],
        summary: "List images",
        responses: { 200: { description: "Images returned" } }
      }
    },
    "/posts": {
      post: {
        tags: ["Posts"],
        summary: "Create a blog post",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PostInput" } } }
        },
        responses: { 201: { description: "Post created" }, 400: { description: "Invalid request" } }
      },
      get: {
        tags: ["Posts"],
        summary: "List blog posts",
        responses: { 200: { description: "Posts returned" } }
      }
    },
    "/jobs/classify": {
      post: {
        tags: ["Jobs"],
        summary: "Queue image classification",
        responses: { 202: { description: "Classification job queued" } }
      }
    },
    "/jobs/{id}": {
      get: {
        tags: ["Jobs"],
        summary: "Get classification job status",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { 200: { description: "Job returned" }, 404: { description: "Job not found" } }
      }
    },
    "/posts/{id}/images": {
      get: {
        tags: ["Posts"],
        summary: "Rank and guard image candidates for a post",
        parameters: [{ $ref: "#/components/parameters/id" }],
        responses: { 200: { description: "Ranked candidates returned" }, 404: { description: "Post not found" } }
      }
    },
    "/posts/{postId}/images/{imageId}/review": {
      post: {
        tags: ["Reviews"],
        summary: "Approve or reject an image recommendation",
        parameters: [
          { $ref: "#/components/parameters/postId" },
          { $ref: "#/components/parameters/imageId" }
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewInput" } } }
        },
        responses: { 201: { description: "Review recorded" }, 400: { description: "Invalid request" } }
      }
    },
    "/costs": {
      get: {
        tags: ["Costs"],
        summary: "List AI usage cost records",
        responses: { 200: { description: "Cost records returned" } }
      }
    }
  }
};
