# PDF report generator

This service queues a sales report, aggregates source data in MongoDB, renders a PDF in a background worker, and stores the artifact on disk. The API only returns job metadata; it never transports the generated PDF through the job payload.

## Run it

1. Install Node.js 18+ and MongoDB.
2. Copy `.env.example` to `.env` and adjust `MONGODB_URI` if needed.
3. Run `npm install`.
4. Run `npm run seed` to add demo orders.
5. Run `npm start`.

Swagger UI is available at `http://localhost:3000/docs`.

## API flow

```powershell
$job = Invoke-RestMethod -Method Post -Uri http://localhost:3000/reports -ContentType 'application/json' -Body '{}'
Invoke-RestMethod -Uri "http://localhost:3000/reports/$($job.id)"
Invoke-WebRequest -Uri "http://localhost:3000/reports/$($job.id)/download" -OutFile report.pdf
```

`POST /reports` accepts optional ISO-8601 `from` and `to` dates. A job starts as `pending`, is atomically claimed as `running`, and ends as `completed` or `failed`. Failed jobs can be requeued with `POST /reports/:id/retry`.

## Scheduling

The worker is intentionally on-demand by default. For a scheduled deployment, invoke `POST /reports` from the platform scheduler (or add a scheduler that calls the same service endpoint). This keeps scheduling separate from report execution and works with multiple service instances.

## Collections

- `orders`: source data (`category`, `quantity`, `unitPrice`, `createdAt`)
- `reportJobs`: job state, filters, summary, and artifact metadata
