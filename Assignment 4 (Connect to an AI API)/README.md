# Support-message triage API

This Node.js/Express API asks Google Gemini to classify a support message and validates the model output with Zod.

## Setup

```powershell
npm install
Copy-Item .env.example .env
# Set AI_API_KEY in .env
npm test
npm start
```

## React demo frontend

Run the API and frontend in two separate terminals:

```powershell
npm start
npm run frontend
```

Then open [http://localhost:5173](http://localhost:5173). The Vite development
server proxies `/api` requests to the Express API on port 3000, so the API key
remains on the backend and is never exposed to the browser.

## Endpoint

`POST /api/v1/triage`

```json
{ "message": "I was charged twice for my subscription." }
```

The response is `200` and contains `category`, `urgency`, `sentiment`, `summary`, and `confidence`. Invalid input returns `400`; invalid model output returns `502`; provider timeouts/outages return `503`; unexpected processing failures return `500`.

The default provider is Google AI Studio. Create a key at
[Google AI Studio](https://aistudio.google.com/app/apikey), then set
`AI_API_KEY` in `.env`. The default Gemini model is `gemini-3-flash-preview`.

The AI client uses an 8-second timeout by default and retries only transient network errors, HTTP 429, and HTTP 5xx responses (two retries by default). It never accepts arbitrary model output: every response must pass the strict schema.
