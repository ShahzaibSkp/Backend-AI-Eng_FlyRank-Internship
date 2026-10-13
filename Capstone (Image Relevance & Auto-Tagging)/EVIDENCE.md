# Evidence

| Requirement | Proof |
| --- | --- |
| Structured vision output is schema validated | `test/app.test.js` verifies the classification job only stores provider output after `imageTagsSchema.parse`; provider failures retry and end in `failed`. |
| Low confidence is flagged | `classifies and flags low-confidence images` passes with `status: flagged`. |
| Background batch with retries | `POST /jobs/classify` returns `202`; `src/jobs.js` performs three attempts per image and tracks `processed`. |
| Semantic ranking and mismatch guard | `returns no confident match for a wolf forced against a fox post` passes with a human-readable mismatch reason. |
| Review API | `POST /posts/:postId/images/:imageId/review` stores an approval or rejection with an optional note. |
| Cost tracking | `GET /costs` returns attributed `vision` and local `embedding` records; local embeddings are recorded at `0` USD. |
| Boundary validation | `rejects invalid input at the boundary` returns HTTP 400 rather than 500. |
| Idempotent processing | Re-running a completed classification job does not create duplicate cost records for already processed images. |
| Swagger API | `GET /openapi.json` returns OpenAPI 3.0.3 and `GET /docs/` returns Swagger UI. |
| Evaluation | `npm run eval` reports `Top-1 guard precision: 2/2 (100%)` for the included labeled set. |
