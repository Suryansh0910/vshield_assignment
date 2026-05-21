# vShield — Background Verification Platform

vShield is a full-stack Background Verification (BGV) platform built for recruiters and HR teams. It lets you onboard candidates, run automated Aadhaar and PAN identity checks via mock verification APIs, track results through a Kanban pipeline, and download professional PDF reports — all secured behind JWT authentication.

**Live Demo:** [vshield-assignment.vercel.app](https://vshield-assignment.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [How Verification Works](#how-verification-works)
- [Security Design](#security-design)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)

---

## Features

### Authentication & Sessions
- Register and login with email + password
- Short-lived **JWT access tokens** (15 min) sent in response body
- Long-lived **refresh tokens** stored as HTTP-only cookies (7 days), hashed with SHA-256 before saving to the database — the raw token never touches the DB
- Automatic silent token refresh via Axios interceptor on 401 responses
- Session table tracks device IP and user agent; supports **logout-all** to revoke every active session

### Candidate Management
- Create candidates with full name, email, phone, date of birth, address, Aadhaar number, and PAN number
- List with real-time search across name, email, and phone
- Sensitive fields masked in all API responses: Aadhaar shown as `XXXX-XXXX-9012`, PAN as `ABCDE****F`
- Ownership enforced — users can only view and modify their own candidates

### Identity Verification
- One-click **Run Verification** triggers both Aadhaar and PAN checks in parallel
- Each check is logged as a `VerificationLog` record with full request/response payloads
- Mock APIs apply deterministic rules (see [How Verification Works](#how-verification-works)) so results are reproducible without external services
- Overall candidate status is derived automatically from individual check results

### Kanban Pipeline Dashboard
- 4-column board showing candidates grouped by status:
  - **Not Reviewed** — newly added, verification not yet run
  - **Partial** — one of the two checks passed
  - **Accepted** — both Aadhaar and PAN verified
  - **Rejected** — both checks failed
- Live sidebar counters update as candidates move through the pipeline
- Click any card to jump to the full candidate detail page

### PDF Report Generation
- Generates a professional A4 PDF per candidate using **PDFKit** (pure JavaScript — no browser or Chromium required)
- Report includes: candidate personal info, masked document numbers, individual verification statuses with colour-coded badges, overall status, generation timestamp, and a unique report ID
- PDF is streamed directly to the browser as a download

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | UI framework and build tool |
| State | Zustand | Lightweight global state for auth and candidates |
| Forms | Zod | Client-side validation schemas |
| HTTP | Axios | API calls with request/response interceptors |
| Icons | Lucide React | Icon library |
| Backend | Node.js + Express | REST API server |
| ORM | Prisma | Type-safe database access + migrations |
| Database | PostgreSQL | Primary data store |
| Auth | jsonwebtoken + bcryptjs | Token signing and password hashing |
| Validation | Zod | Server-side input validation |
| PDF | PDFKit | Programmatic PDF generation |
| Security | Helmet + express-rate-limit | HTTP headers hardening and rate limiting |

---

## Architecture Overview

```
Browser (Vercel)
      │
      │  HTTPS + Bearer token
      ▼
Express API (Render)
      │
      ├── Auth middleware ──── validates JWT on every protected route
      ├── Rate limiter ──────── 100 req/15 min (auth), 50 req/hr (verification)
      │
      ├── /api/auth ──────────── register, login, refresh, logout
      ├── /api/candidates ────── CRUD, search, ownership check
      ├── /api/verifications ─── start checks, fetch logs
      ├── /api/reports ───────── generate + stream PDF
      └── /mock-api ──────────── mock Aadhaar/PAN endpoints
            │
            ▼
       PostgreSQL (Neon / Supabase)
```

**Token flow:**
1. Login → server returns `accessToken` in JSON body + sets `refreshToken` in HTTP-only cookie
2. Frontend stores `accessToken` in Zustand (memory only, never localStorage)
3. Every request attaches `Authorization: Bearer <accessToken>`
4. On 401, Axios interceptor silently POSTs to `/api/auth/refresh` using the cookie, gets a new access token, and retries the original request
5. Logout deletes the session row and clears the cookie

---

## Project Structure

```
vshield/
│
├── Backend/
│   ├── config/
│   │   ├── database.js          # Prisma client singleton
│   │   └── env.js               # Single source of truth for all env vars
│   │
│   ├── controller/
│   │   ├── authController.js    # register, login, me, refresh, logout, logout-all
│   │   ├── candidateController.js
│   │   ├── verificationController.js
│   │   ├── reportController.js
│   │   └── mockApiController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification, attaches req.user
│   │   └── errorHandler.js     # Global error handler
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── verificationRoutes.js
│   │   ├── reportRoutes.js
│   │   └── mockApiRoutes.js
│   │
│   ├── services/
│   │   ├── verificationService.js  # Mock Aadhaar + PAN logic
│   │   └── reportService.js        # PDFKit document builder
│   │
│   ├── utils/
│   │   ├── helpers.js           # maskAadhaar, maskPAN, sanitizeCandidateData
│   │   └── validations.js       # Zod schemas for all request bodies
│   │
│   ├── prisma/
│   │   └── schema.prisma        # User, Candidate, VerificationLog, Session
│   │
│   ├── seed.js                  # Seeds a demo user + sample candidates
│   └── server.js                # Express app entry point
│
└── Frontend/
    └── src/
        ├── api/
        │   └── axios.js         # Axios instance, token interceptors, auto-refresh
        │
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx    # 4-column Kanban pipeline
        │   └── CandidateDetail.jsx
        │
        ├── components/
        │   └── AddCandidateModal.jsx
        │
        ├── store/
        │   ├── authStore.js     # Zustand: user, accessToken, isAuthenticated
        │   └── candidateStore.js # Zustand: candidates list, stats, fetchCandidates
        │
        └── utils/
            └── validationSchemas.js
```

---

## Database Schema

### User
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Display name |
| email | String | Unique |
| passwordHash | String | bcrypt, 10 rounds |
| createdAt | DateTime | Auto |

### Candidate
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| fullName | String | |
| email | String | |
| phone | String | |
| aadhaarNumber | String | Stored plain, masked on response |
| panNumber | String | Stored plain, masked on response |
| dob | DateTime | |
| address | String | |
| status | String | `PENDING` \| `PARTIAL` \| `VERIFIED` \| `FAILED` |
| reportUrl | String? | Set after first PDF generation |
| createdById | UUID | FK → User (cascade delete) |

### VerificationLog
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| candidateId | UUID | FK → Candidate (cascade delete) |
| verificationType | String | `AADHAAR` \| `PAN` |
| requestPayload | JSON | What was sent to the verification service |
| responsePayload | JSON | What the verification service returned |
| verificationStatus | String | `VERIFIED` \| `FAILED` |
| verifiedAt | DateTime | Auto |

### Session
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | FK → User (cascade delete) |
| refreshTokenHash | String | SHA-256 hash of the raw refresh token |
| ip | String | Client IP at login time |
| userAgent | String | Browser/device info |
| revoked | Boolean | Set to true on logout |

---

## API Reference

All protected routes require `Authorization: Bearer <accessToken>`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account. Body: `{ name, email, password }` |
| POST | `/login` | No | Authenticate. Returns `accessToken`, sets refresh cookie |
| GET | `/me` | Yes | Returns current user profile |
| POST | `/refresh` | Cookie | Exchange refresh token for a new access token |
| POST | `/logout` | Yes | Revoke current session, clear cookie |
| POST | `/logout-all` | Yes | Revoke all sessions for the user |

### Candidates — `/api/candidates`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Create candidate. Body: full candidate object |
| GET | `/` | Yes | List own candidates. Query: `?search=name&page=1&limit=10` |
| GET | `/:id` | Yes | Get single candidate (with masked sensitive fields) |
| PUT | `/:id` | Yes | Update candidate fields |
| DELETE | `/:id` | Yes | Delete candidate and all associated logs |

### Verifications — `/api/verifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:id/start` | Yes | Run Aadhaar + PAN checks, update candidate status |
| GET | `/:id/logs` | Yes | Fetch all verification log entries for a candidate |

### Reports — `/api/reports`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:id/generate` | Yes | Generate PDF and stream it as a download |
| GET | `/:id/download` | Yes | Re-generate and download the PDF again |

### Mock APIs — `/mock-api` (no auth)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/aadhaar/verify` | Body: `{ aadhaarNumber }` |
| POST | `/pan/verify` | Body: `{ panNumber }` |

---

## How Verification Works

Since this is a demo platform, verification is handled by deterministic mock logic — no external API keys needed.

**Aadhaar:** The last digit of the Aadhaar number determines the result.
- Last digit **even** → `VERIFIED`
- Last digit **odd** → `FAILED`

**PAN:** The first character of the PAN number determines the result.
- Starts with a **vowel** (A, E, I, O, U) → `VERIFIED`
- Starts with a **consonant** → `FAILED`

**Overall candidate status** is derived from both results:

| Aadhaar | PAN | Candidate Status |
|---|---|---|
| VERIFIED | VERIFIED | `VERIFIED` (Accepted) |
| VERIFIED | FAILED | `PARTIAL` |
| FAILED | VERIFIED | `PARTIAL` |
| FAILED | FAILED | `FAILED` (Rejected) |

---

## Security Design

| Concern | Implementation |
|---|---|
| Passwords | bcrypt with 10 salt rounds |
| Access tokens | JWT, 15-minute expiry, signed with `JWT_SECRET` |
| Refresh tokens | 7-day JWT stored as HTTP-only cookie; SHA-256 hash saved in DB |
| Token refresh | Silent retry via Axios interceptor, no user interaction needed |
| Ownership | Every candidate/log query checks `createdById === req.user.id` |
| Sensitive data | Aadhaar and PAN always masked before leaving the server |
| Rate limiting | Auth: 100 req / 15 min · Verification: 50 req / hour (per real IP) |
| Proxy trust | `app.set("trust proxy", 1)` ensures Render's `X-Forwarded-For` is used for rate limiting, not the proxy IP |
| HTTP headers | Helmet sets `X-Content-Type-Options`, `X-Frame-Options`, HSTS, etc. |
| CORS | Reflects request origin (supports all Vercel preview URLs + localhost) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local install, or a free cloud DB from [Neon](https://neon.tech) / [Supabase](https://supabase.com))

### 1. Clone the repo

```bash
git clone https://github.com/Suryansh0910/vshield_assignment.git
cd vshield_assignment
```

### 2. Backend setup

```bash
cd Backend
npm install

# Copy the example env file and fill in your values
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vshield_db"
JWT_SECRET="change_me_to_a_long_random_string"
JWT_REFRESH_SECRET="change_me_to_another_long_random_string"
PORT=5005
NODE_ENV=development
```

```bash
# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with a demo user and sample candidates
node seed.js

# Start the dev server (with hot reload)
npm run dev
```

The API will be running at **http://localhost:5005**

### 3. Frontend setup

```bash
cd ../Frontend
npm install

# Create a local env file
echo "VITE_API_URL=http://localhost:5005" > .env.local

npm run dev
```

The app will open at **http://localhost:5173**

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Access token signing key | any long random string |
| `JWT_EXPIRY` | No | Access token lifetime | `15m` (default) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing key | any long random string |
| `JWT_REFRESH_EXPIRY` | No | Refresh token lifetime | `7d` (default) |
| `PORT` | No | Server port | `5005` (default) |
| `NODE_ENV` | No | Environment | `development` / `production` |

### Frontend (`Frontend/.env.local`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Backend base URL | `https://your-app.onrender.com` |

---

## Deployment

The app is deployed with:
- **Frontend** → [Vercel](https://vercel.com) (auto-deploys from `main`)
- **Backend** → [Render](https://render.com) (Node.js web service)
- **Database** → [Neon](https://neon.tech) (serverless PostgreSQL)

### Deploy backend to Render

1. Create a new **Web Service** pointing to the `Backend/` folder
2. Set **Build Command:** `npm install && npx prisma generate`
3. Set **Start Command:** `npm start`
4. Add these environment variables in the Render dashboard:

```
DATABASE_URL        = <your Neon / Supabase connection string>
JWT_SECRET          = <strong random string>
JWT_REFRESH_SECRET  = <strong random string>
NODE_ENV            = production
```

### Deploy frontend to Vercel

1. Import the repository and set **Root Directory** to `Frontend`
2. Add this environment variable:

```
VITE_API_URL = https://your-backend.onrender.com
```

3. Deploy — Vercel handles the Vite build automatically

### Run database migrations in production

```bash
# From your local machine against the production DB
DATABASE_URL="<production connection string>" npx prisma migrate deploy
```

---

## Demo Credentials

After running `node seed.js`:

```
Email:    admin@vshield.com
Password: admin123
```

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma studio` | Open Prisma's visual DB browser |
| `node seed.js` | Seed the database with demo data |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
