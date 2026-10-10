# Auth Login & Protect API

Secure Node.js and Express.js API for Assignment 3. Supabase Auth is the
identity provider: it creates accounts, validates passwords, issues JWT access
tokens, and invalidates sessions. MongoDB can be added for application data;
it is not required to store Supabase authentication users.

## Requirements

- Node.js 18+
- A Supabase project

## Setup

```bash
npm install
copy .env.example .env
```

Put your Supabase values in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3000
```

Start the API:

```bash
npm start
```

The server runs at `http://localhost:3000` and Swagger UI is available at
`http://localhost:3000/docs`.

## API reference

| Method | Endpoint | Authentication |
| --- | --- | --- |
| POST | `/auth/signup` | No |
| POST | `/auth/login` | No |
| POST | `/auth/logout` | Bearer JWT |
| GET | `/protected/profile` | Bearer JWT |
| GET | `/protected/dashboard` | Bearer JWT |
| GET | `/public/info` | No |

### Signup

```bash
curl -i -X POST http://localhost:3000/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Login

```bash
curl -i -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Copy `access_token` from the login response, then authorize in Swagger using
the **Authorize** button or call the protected route:

```bash
curl -i http://localhost:3000/protected/profile ^
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE"
```

Never commit `.env`; `.gitignore` already excludes it. Use `.env.example` as
the safe setup template for GitHub.

The signup `metadata` object is optional. Supabase stores it as
`user_metadata`, and the protected profile endpoint returns it. Do not put
passwords, API keys, or other secrets in user metadata.
