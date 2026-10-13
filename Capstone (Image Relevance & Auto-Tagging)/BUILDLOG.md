# Build log

- Read the FlyRank capstone brief and translated its acceptance probes into API routes and tests.
- Used AI assistance to scaffold the Express service, schemas, persistence adapter, retryable job, vector utilities, guard, and documentation.
- Chose a deterministic demo provider so reviewers can run the acceptance flow without a paid credential. Gemini is isolated behind the same provider contract.
- Verified boundary validation, low-confidence flagging, and fox/wolf rejection with automated tests.
- Removed the frontend path and added Swagger UI as the backend testing surface.
- Tuned the local similarity threshold against the included corpus and added idempotent classification/cost behavior.
