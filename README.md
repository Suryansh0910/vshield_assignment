# vShield — Background Verification Platform

A secure, full-stack Background Verification platform that lets recruiters submit candidate details, run Aadhaar and PAN verification via mock APIs, and download professional PDF reports.

---

## Features

- **Authentication** — JWT access tokens + HTTP-only refresh tokens, session management, logout-all
- **Candidate Management** — Create, read, update, delete candidates with search and pagination
- **Aadhaar & PAN Verification** — Mock verification APIs with regex validation
- **Status Tracking** — VERIFIED / PARTIAL / FAILED / PENDING
- **PDF Report Generation** — Professional Puppeteer-generated PDF saved to disk
- **React Hook Form + Zod** — Full client-side and server-side validation
- **Sensitive Data Masking** — Aadhaar shown as `XXXX-XXXX-1234`, PAN as `ABCDE****F`
- **Security** — Helmet, CORS, rate limiting, bcrypt, ownership checks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Hook Form, Zod, Zustand, Axios, Lucide React |
| Backend | Node.js, Express.js, Prisma ORM, JWT, bcryptjs, Zod, Puppeteer |
| Database | PostgreSQL |
| PDF | Puppeteer (HTML → PDF) |

---

## Project Structure

```
vshield/
├── Backend/
│   ├── controller/          # Route handlers
│   ├── services/            # Business logic (verification, PDF)
│   ├── routes/              # Express routers
│   ├── middleware/          # Auth, error handler
│   ├── utils/               # Validation schemas, helpers (masking)
│   ├── config/              # DB client, env config
│   ├── prisma/              # Schema + migrations
│   ├── reports/             # Generated PDF files (auto-created)
│   ├── seed.js              # Sample data seeder
│   └── server.js
│
└── Frontend/
    └── src/
        ├── pages/           # Login, Register, Dashboard, CandidateDetail
        ├── components/      # AddCandidateModal
        ├── store/           # Zustand stores (auth, candidates)
        ├── api/             # Axios instance with interceptors
        └── utils/           # Zod validation schemas
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Neon/Supabase)

### Backend

```bash
cd Backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# Run database migrations
npx prisma migrate dev

# (Optional) Seed with demo data
node seed.js

# Start development server
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173** and the API at **http://localhost:5005**

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/bgv_db` |
| `JWT_SECRET` | Access token signing secret | `your_secret_here` |
| `JWT_EXPIRY` | Access token lifetime | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | `your_refresh_secret` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime | `7d` |
| `PORT` | Backend port | `5005` |
| `NODE_ENV` | Environment | `development` |
| `AADHAAR_API_URL` | Aadhaar mock endpoint | `http://localhost:5005/mock-api/aadhaar/verify` |
| `PAN_API_URL` | PAN mock endpoint | `http://localhost:5005/mock-api/pan/verify` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token via cookie |
| POST | `/api/auth/logout` | Logout current session |
| POST | `/api/auth/logout-all` | Logout all sessions |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/candidates` | Create candidate |
| GET | `/api/candidates` | List candidates (search, pagination) |
| GET | `/api/candidates/:id` | Get candidate detail |
| PUT | `/api/candidates/:id` | Update candidate |
| DELETE | `/api/candidates/:id` | Delete candidate |

### Verification
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/verifications/:id/start` | Run Aadhaar + PAN verification |
| GET | `/api/verifications/:id/logs` | Get verification logs |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reports/:id/generate` | Generate and download PDF |
| GET | `/api/reports/:id/download` | Download existing report |

### Mock APIs (no auth required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/mock-api/aadhaar/verify` | Mock Aadhaar verification |
| POST | `/mock-api/pan/verify` | Mock PAN verification |

---

## Database Schema

```
User          → has many Candidates, Sessions
Candidate     → has many VerificationLogs
VerificationLog → belongs to Candidate
Session       → belongs to User (refresh token management)
```

### Verification Status Logic
- Both VERIFIED → `VERIFIED`
- One VERIFIED, one FAILED → `PARTIAL`
- Both FAILED → `FAILED`

---

## Demo Credentials (after running seed.js)

```
Email:    admin@vshield.com
Password: admin123
```

---

## Screenshots

- Login Page → Clean auth form with validation
- Dashboard → 4 stat cards + 4-column Kanban (Verified / Partial / Pending / Failed)
- Candidate Detail → Personal info, verification logs, run & download buttons
- PDF Report → Professional A4 report with candidate info, check results, timestamp

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | Neon / Supabase |
# vshield_assignment
