# FlyRank Image Relevance & Auto-Tagging API

An Express backend that classifies an image library, creates shared text embeddings, ranks images for articles, and refuses unsafe matches. The default `demo` provider is deterministic and needs no API key; set `VISION_PROVIDER=gemini` to use Gemini Flash.

This repository is intentionally backend-only. There is no frontend application or frontend build step. Swagger UI is available for interactive API testing.

## Architecture

```text
images -> classification job -> Zod tags -> embeddings -> MongoDB
posts  -----------------------> embeddings ---------^
                                  |
GET /posts/:id/images -> ranking -> mismatch guard -> recommendation/rejection
                                             |
                                  review + cost audit APIs
```

The HTTP, domain logic, provider, vector, and persistence layers are separate. MongoDB is used when available; the server explicitly falls back to an in-memory demo store so the acceptance probes work without external services.

## Run

```bash
npm install
copy .env.example .env
npm run seed
npm start
```

Open `http://localhost:3000/docs` for Swagger UI. The machine-readable specification is available at `http://localhost:3000/openapi.json`.

For persistent data, start MongoDB first and keep the default URI. The seed command creates demo images and posts, runs the retryable classification job, and records one cost row per AI operation. The demo corpus uses licensed-free Unsplash image URLs for presentation and reproducibility.

## API

- `POST /images` and `GET /images`
- `POST /posts` and `GET /posts`
- `POST /jobs/classify`, `GET /jobs/:id`
- `GET /posts/:id/images` (ranked candidates, guard reasons, and recommendation)
- `POST /posts/:postId/images/:imageId/review`
- `GET /costs`
- `GET /health`
- `GET /docs`
- `GET /openapi.json`

Every request body is validated with Zod. Classifications below the confidence threshold are flagged, not accepted. Vision calls are retried up to three times and each successful call has an attributed cost record.

## Evaluation

```bash
npm test
npm run eval
```

The included evaluation currently reports 100% guard precision on the small labeled fox/wolf set. Expand the dataset before presenting a final benchmark; this is a demo corpus, not a production quality claim. The default local embedding threshold is `0.25`, tuned against the included corpus; override it with `SIMILARITY_THRESHOLD` when using a different embedding provider.

## Limitations

The demo provider uses controlled labels so reviewers can run the acceptance flow without an API key. The Gemini provider downloads the configured image URL and sends the image bytes to Gemini Flash for structured analysis. The local embedding implementation is intentionally small and deterministic; a production deployment should use a managed or local embedding model and a vector index. MongoDB fallback is not a substitute for production persistence.
